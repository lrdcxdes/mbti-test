document.addEventListener('DOMContentLoaded', () => {
    // --- ЭЛЕМЕНТЫ DOM ---
    const screens = document.querySelectorAll('.screen');
    const startInstructionBtn = document.getElementById('start-instruction-btn');
    const instructionContent = document.getElementById('instruction-content');
    const nextInstructionBtn = document.getElementById('next-instruction-btn');
    const questionElement = document.getElementById('question');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const backBtn = document.getElementById('back-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resultTitle = document.getElementById('mbti-type-title');
    const resultArchetype = document.getElementById('mbti-archetype');
    const resultTabs = document.querySelector('.result-tabs');
    const resultContent = document.getElementById('result-content');
    const restartBtn = document.getElementById('restart-btn');
    const reviewAnswersBtn = document.getElementById('review-answers-btn');
    const reviewList = document.getElementById('review-list');
    const recalculateBtn = document.getElementById('recalculate-btn');
    const backToResultBtn = document.getElementById('back-to-result-btn');

    // --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
    let currentScreen = 'welcome';
    let currentQuestionIndex = 0;
    let currentInstructionIndex = 0;
    let userAnswers = new Array(questions.length).fill(null);
    let finalType = null;

    const instructions = [
        { title: "Найдите тишину", text: "Для максимальной точности найдите спокойное место, где вас не будут отвлекать в течение следующих 5-7 минут." },
        { title: "Доверяйте интуиции", text: "Не анализируйте вопросы слишком долго. Ваш первый, инстинктивный ответ чаще всего является самым верным." },
        { title: "Будьте честны", text: "Здесь нет правильных или неправильных ответов. Отвечайте так, как есть на самом деле, а не так, как вам хотелось бы, чтобы было." },
    ];

    // --- ФУНКЦИИ УПРАВЛЕНИЯ ЭКРАНАМИ ---
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');
        currentScreen = screenId;
    }

    // --- ФУНКЦИИ ИНСТРУКТАЖА ---
    function startInstructions() {
        currentInstructionIndex = 0;
        renderInstruction();
        showScreen('instruction');
    }

    function renderInstruction() {
        const instruction = instructions[currentInstructionIndex];
        instructionContent.innerHTML = `<h2>${instruction.title}</h2><p>${instruction.text}</p>`;
        if (currentInstructionIndex === instructions.length - 1) {
            nextInstructionBtn.textContent = "Я готов(а)";
        } else {
            nextInstructionBtn.textContent = "Далее";
        }
    }

    function handleNextInstruction() {
        currentInstructionIndex++;
        if (currentInstructionIndex < instructions.length) {
            renderInstruction();
        } else {
            startQuiz();
        }
    }

    // --- ФУНКЦИИ КВИЗА ---
    function startQuiz() {
        currentQuestionIndex = 0;
        userAnswers.fill(null);
        renderQuestion();
        showScreen('quiz');
    }



    function renderQuestion() {
        // Очистка предыдущих ответов
        answerButtonsContainer.innerHTML = '';

        // Рендер вопроса
        const question = questions[currentQuestionIndex];
        questionElement.textContent = question.question;

        // Создание кнопок ответов
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerHTML = answer.text;
            button.classList.add('answer-btn');
            button.dataset.value = answer.value;
            if (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].value === answer.value) {
                button.classList.add('selected');
            }
            button.addEventListener('click', () => selectAnswer(answer.value, answer.text));
            answerButtonsContainer.appendChild(button);
        });

        // Обновление прогресс-бара и навигации
        updateProgress();
        backBtn.disabled = currentQuestionIndex === 0;
    }

    function selectAnswer(value, text) {
        userAnswers[currentQuestionIndex] = { value, text };
        // Переход к следующему вопросу с небольшой задержкой для UX
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                renderQuestion();
            } else {
                showLoadingAndCalculate();
            }
        }, 300); // 300ms задержка
    }

    function goBack() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    }

    function updateProgress() {
        const progress = (currentQuestionIndex / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Шаг ${currentQuestionIndex + 1} из ${questions.length}`;
    }

    // --- ФУНКЦИИ РЕЗУЛЬТАТА ---
    function showLoadingAndCalculate() {
        showScreen('loading');
        setTimeout(() => {
            calculateResult();
            renderResult();
            showScreen('result');
        }, 2000); // Имитация анализа
    }

    function calculateResult() {
        let scores = { "Te": 0, "Ti": 0, "Fe": 0, "Fi": 0, "Se": 0, "Si": 0, "Ne": 0, "Ni": 0 };
        userAnswers.forEach(answer => {
            if (answer) scores[answer.value]++;
        });

        const functionStacks = { 'ISTJ': ['Si', 'Te', 'Fi', 'Ne'], 'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'], 'INFJ': ['Ni', 'Fe', 'Ti', 'Se'], 'INTJ': ['Ni', 'Te', 'Fi', 'Se'], 'ISTP': ['Ti', 'Se', 'Ni', 'Fe'], 'ISFP': ['Fi', 'Se', 'Ni', 'Te'], 'INFP': ['Fi', 'Ne', 'Si', 'Te'], 'INTP': ['Ti', 'Ne', 'Si', 'Fe'], 'ESTP': ['Se', 'Ti', 'Fe', 'Ni'], 'ESFP': ['Se', 'Fi', 'Te', 'Ni'], 'ENFP': ['Ne', 'Fi', 'Te', 'Si'], 'ENTP': ['Ne', 'Ti', 'Fe', 'Si'], 'ESTJ': ['Te', 'Si', 'Ne', 'Fi'], 'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'], 'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'], 'ENTJ': ['Te', 'Ni', 'Se', 'Fi'] };
        let bestMatch = '';
        let highestScore = -1;

        for (const type in functionStacks) {
            let currentScore = 0;
            const stack = functionStacks[type];
            currentScore += (scores[stack[0]] || 0) * 4; // Dominant
            currentScore += (scores[stack[1]] || 0) * 3; // Auxiliary
            currentScore += (scores[stack[2]] || 0) * 2; // Tertiary
            currentScore += (scores[stack[3]] || 0) * 1; // Inferior
            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestMatch = type;
            }
        }
        finalType = bestMatch || "INTP"; // Fallback
    }

    function renderResult() {
        const typeData = descriptions[finalType] || { archetype: "Неизвестно", description: "Нет данных.", functions: "", strengths: "", growth: "" };
        resultTitle.textContent = finalType;
        resultArchetype.textContent = typeData.archetype;
        renderResultTabContent('description');
    }

    function renderResultTabContent(tabName) {
        const typeData = descriptions[finalType];
        resultContent.innerHTML = `<p>${typeData[tabName]}</p>`;

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    }

    // --- ФУНКЦИИ РЕДАКТИРОВАНИЯ ---
    function renderReviewScreen() {
        reviewList.innerHTML = '';
        questions.forEach((q, index) => {
            const item = document.createElement('div');
            item.classList.add('review-item');

            const questionText = document.createElement('p');
            questionText.classList.add('review-question');
            questionText.textContent = `${index + 1}. ${q.question}`;
            item.appendChild(questionText);

            q.answers.forEach(ans => {
                const btn = document.createElement('button');
                btn.classList.add('review-answer-btn');
                btn.textContent = ans.text;
                if(userAnswers[index] && userAnswers[index].value === ans.value) {
                    btn.classList.add('selected');
                }
                btn.addEventListener('click', () => {
                    userAnswers[index] = { value: ans.value, text: ans.text };
                    renderReviewScreen(); // Re-render to update selection
                });
                item.appendChild(btn);
            });
            reviewList.appendChild(item);
        });
        showScreen('review');
    }

    // --- НАЗНАЧЕНИЕ СОБЫТИЙ ---
    startInstructionBtn.addEventListener('click', startInstructions);
    nextInstructionBtn.addEventListener('click', handleNextInstruction);
    backBtn.addEventListener('click', goBack);
    restartBtn.addEventListener('click', () => showScreen('welcome'));
    resultTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            renderResultTabContent(e.target.dataset.tab);
        }
    });
    reviewAnswersBtn.addEventListener('click', renderReviewScreen);
    backToResultBtn.addEventListener('click', () => showScreen('result'));
    recalculateBtn.addEventListener('click', showLoadingAndCalculate);

    // --- ИНИЦИАЛИЗАЦИЯ ---
    showScreen('welcome');
});