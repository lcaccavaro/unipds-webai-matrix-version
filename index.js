const aiContext = {
    session: null,
    abortController: null,
    isGenerating: false,
};

const elements = {
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temp-value'),
    topKValue: document.getElementById('topk-value'),
    topK: document.getElementById('topK'),
    form: document.getElementById('question-form'),
    questionInput: document.getElementById('question'),
    output: document.getElementById('output'),
    button: document.getElementById('ask-button'),
    year: document.getElementById('year'),
};

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function appendTerminalLine(text, className) {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    elements.output.appendChild(line);
    elements.output.scrollTop = elements.output.scrollHeight;
    return line;
}

async function setupEventListeners() {
    const updateTemperatureValue = (value) => {
        elements.temperatureValue.textContent = value;
    };

    const updateTopKValue = (value) => {
        elements.topKValue.textContent = value;
    };

    const handleTemperatureEvent = (e) => updateTemperatureValue(e.target.value);
    const handleTopKEvent = (e) => updateTopKValue(e.target.value);

    elements.temperature.addEventListener('input', handleTemperatureEvent);
    elements.temperature.addEventListener('change', handleTemperatureEvent);
    elements.temperature.addEventListener('pointermove', handleTemperatureEvent);

    elements.topK.addEventListener('input', handleTopKEvent);
    elements.topK.addEventListener('change', handleTopKEvent);
    elements.topK.addEventListener('keyup', (e) => updateTopKValue(e.target.value));

    elements.form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (aiContext.isGenerating) {
            toggleSendOrStopButton(false);
            return;
        }

        await onSubmitQuestion();
    });

    updateTemperatureValue(elements.temperature.value);
    updateTopKValue(elements.topK.value);
}

async function onSubmitQuestion() {
    const question = elements.questionInput.value.trim();
    if (!question) {
        return;
    }

    const temperature = Math.min(Math.max(parseFloat(elements.temperature.value), 0), 2);
    let topK = parseInt(elements.topK.value, 10);
    if (Number.isNaN(topK) || topK < 1) {
        topK = 1;
    }
    console.log('Using parameters:', { temperature, topK });

    appendTerminalLine(`> ${escapeHtml(question)}`, 'user-line');
    const responseLine = appendTerminalLine('', 'ai-line');
    elements.questionInput.value = '';
    elements.questionInput.focus();

    toggleSendOrStopButton(true);

    try {
        for await (const chunk of askAI(question, temperature, topK)) {
            if (aiContext.abortController.signal.aborted) {
                break;
            }
            responseLine.textContent += chunk;
            elements.output.scrollTop = elements.output.scrollHeight;
        }
    } catch (error) {
        responseLine.textContent = `Erro: ${error?.message || error}`;
    } finally {
        toggleSendOrStopButton(false);
    }
}

function toggleSendOrStopButton(isGenerating) {
    if (isGenerating) {
        aiContext.isGenerating = true;
        elements.button.textContent = 'Parar';
        elements.button.classList.add('stop-button');
    } else {
        aiContext.abortController?.abort();
        aiContext.isGenerating = false;
        elements.button.textContent = 'Enviar';
        elements.button.classList.remove('stop-button');
    }
}

async function* askAI(question, temperature, topK) {
    aiContext.abortController?.abort();
    aiContext.abortController = new AbortController();

    if (aiContext.session) {
        aiContext.session.destroy();
    }

    const session = await LanguageModel.create({
        expectedInputLanguages: ['pt'],
        temperature,
        topK,
        initialPrompts: [
            {
                role: 'system',
                content: `Você é um assistente de IA que responde de forma clara e objetiva. Responda sempre em formato de texto ao invés de markdown`,
            },
        ],
    });

    aiContext.session = session;

    const responseStream = await session.promptStreaming(
        [
            {
                role: 'user',
                content: question,
            },
        ],
        {
            signal: aiContext.abortController.signal,
        }
    );

    for await (const chunk of responseStream) {
        if (aiContext.abortController.signal.aborted) {
            break;
        }
        yield chunk;
    }
}

async function checkRequirements() {
    const errors = [];
    const returnResults = () => (errors.length ? errors : null);

    const isChrome = !!window.chrome;
    if (!isChrome) {
        errors.push('⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).');
    }

    if (!('LanguageModel' in self)) {
        errors.push('⚠️ As APIs nativas de IA não estão ativas.');
        errors.push('Ative a seguinte flag em chrome://flags/:');
        errors.push('- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)');
        errors.push('Depois reinicie o Chrome e tente novamente.');
        return returnResults();
    }

    const availability = await LanguageModel.availability({ languages: ['pt'] });
    console.log('Language Model Availability:', availability);
    if (availability === 'available') {
        return returnResults();
    }

    if (availability === 'unavailable') {
        errors.push('⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.');
    }

    if (availability === 'downloading') {
        errors.push('⚠️ O modelo de linguagem de IA está sendo baixado. Por favor, aguarde alguns minutos e tente novamente.');
    }

    if (availability === 'downloadable') {
        errors.push('⚠️ O modelo de linguagem de IA precisa ser baixado, baixando agora... (acompanhe o progresso no terminal do chrome)');
        try {
            const session = await LanguageModel.create({
                expectedInputLanguages: ['pt'],
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        const percent = ((e.loaded / e.total) * 100).toFixed(0);
                        console.log(`Downloaded ${percent}%`);
                    });
                },
            });
            await session.prompt('Olá');
            session.destroy();

            const newAvailability = await LanguageModel.availability({ languages: ['pt'] });
            if (newAvailability === 'available') {
                return null;
            }
        } catch (error) {
            console.error('Error downloading model:', error);
            errors.push(`⚠️ Erro ao baixar o modelo: ${error.message}`);
        }
    }

    return returnResults();
}

(async function main() {
    elements.year.textContent = new Date().getFullYear();

    const reqErrors = await checkRequirements();
    if (reqErrors) {
        elements.output.innerHTML = reqErrors.map((error) => `<div class="terminal-line ai-line">${escapeHtml(error)}</div>`).join('');
        elements.button.disabled = true;
        return;
    }

    const params = await LanguageModel.params();
    console.log('Language Model Params:', params);

    elements.topK.max = params.maxTopK;
    elements.topK.min = 1;
    elements.topK.value = params.defaultTopK;
    elements.topKValue.textContent = params.defaultTopK;

    elements.temperatureValue.textContent = params.defaultTemperature;
    elements.temperature.max = params.maxTemperature;
    elements.temperature.min = 0;
    elements.temperature.value = params.defaultTemperature;

    await setupEventListeners();
})();
