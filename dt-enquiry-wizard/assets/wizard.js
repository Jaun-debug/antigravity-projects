class WizardApp {
    constructor() {
        this.root = document.getElementById('enquiry-wizard-root');
        if (!this.root) return;

        this.state = {
            currentStep: 1,
            answers: {
                destinationKnown: null,
                country: null,
                travelTiming: null,
                travelDates: null,
                travellers: null,
                isAgent: false,
                isMedia: false,
                budget: null
            }
        };

        this.steps = [
            { id: 1, name: 'destination' },
            { id: 2, name: 'timing' },
            { id: 3, name: 'calendar' }, // Optional based on Step 2
            { id: 4, name: 'travellers' },
            { id: 5, name: 'budget' },
            { id: 6, name: 'contact' }
        ];

        this.init();
    }

    init() {
        this.renderOverlay();
        this.handleUrlOnLoad();
        this.bindEvents();
        this.updateUI();

        // Show the wizard
        this.root.classList.add('active');
    }

    renderOverlay() {
        this.root.innerHTML = `
            <div class="dt-wizard-overlay"></div>
            <div class="dt-wizard-container">
                <div class="dt-wizard-nav-top">
                    <button class="dt-wizard-back-btn" id="dt-back-btn" style="display:none;">Back</button>
                    <button class="dt-wizard-close-btn" id="dt-close-btn">×</button>
                </div>
                <div id="dt-step-container"></div>
                <div class="dt-wizard-footer">
                    <button class="dt-next-btn" id="dt-next-btn" disabled>Next</button>
                    <div class="dt-progress-container">
                        <div class="dt-progress-bar" id="dt-progress-bar"></div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Back Button
        document.getElementById('dt-back-btn').addEventListener('click', () => this.goBack());

        // Close Button
        document.getElementById('dt-close-btn').addEventListener('click', () => this.closeWizard());

        // Next Button
        document.getElementById('dt-next-btn').addEventListener('click', () => this.goNext());

        // Delegate clicks for options
        this.root.addEventListener('click', (e) => {
            const optionBtn = e.target.closest('.dt-option-btn');
            if (optionBtn) {
                this.handleOptionSelect(optionBtn);
            }
        });

        // History API
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.step) {
                this.setStep(e.state.step, false);
            }
        });
    }

    handleUrlOnLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const step = parseInt(urlParams.get('_enquiry'));
        if (step && step >= 1 && step <= this.steps.length) {
            this.state.currentStep = step;
        } else {
            this.updateUrl(1);
        }
    }

    updateUrl(step) {
        const url = new URL(window.location);
        url.searchParams.set('_enquiry', step);
        window.history.pushState({ step }, '', url);
    }

    setStep(step, updateHistory = true) {
        this.state.currentStep = step;
        if (updateHistory) this.updateUrl(step);
        this.updateUI();
    }

    goNext() {
        let nextStep = this.state.currentStep + 1;

        // Skip logic: if step 2 "timing" is NOT "exactly", skip calendar (step 3)
        if (this.state.currentStep === 2 && this.state.answers.travelTiming !== 'exactly') {
            nextStep = 4;
        }

        if (nextStep <= this.steps.length) {
            this.setStep(nextStep);
        } else {
            this.submitForm();
        }
    }

    goBack() {
        let prevStep = this.state.currentStep - 1;

        // Skip logic reverse: if coming back to timing from travellers, and didn't pick "exactly", skip calendar
        if (this.state.currentStep === 4 && this.state.answers.travelTiming !== 'exactly') {
            prevStep = 2;
        }

        if (prevStep >= 1) {
            this.setStep(prevStep);
        }
    }

    handleOptionSelect(btn) {
        const value = btn.dataset.value;
        const step = this.state.currentStep;

        // Update state based on step
        switch (step) {
            case 1:
                this.state.answers.country = value;
                break;
            case 2:
                this.state.answers.travelTiming = value;
                break;
            case 4:
                this.state.answers.travellers = value;
                break;
            case 5:
                this.state.answers.budget = value;
                break;
        }

        // Visual feedback: select the button
        const container = btn.parentElement;
        container.querySelectorAll('.dt-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Enable next button
        document.getElementById('dt-next-btn').disabled = false;
    }

    updateUI() {
        const container = document.getElementById('dt-step-container');
        const nextBtn = document.getElementById('dt-next-btn');
        const backBtn = document.getElementById('dt-back-btn');
        const progressBar = document.getElementById('dt-progress-bar');

        // Clear container
        container.innerHTML = '';

        // Render correct step
        const stepHtml = this.renderStep(this.state.currentStep);
        container.innerHTML = stepHtml;

        // Toggle buttons
        backBtn.style.display = this.state.currentStep > 1 ? 'flex' : 'none';

        // Reset Next button state based on answers
        nextBtn.disabled = !this.isStepValid(this.state.currentStep);
        nextBtn.textContent = this.state.currentStep === this.steps.length ? 'Submit' : 'Next';

        // Update progress bar
        const totalSteps = this.steps.length;
        const progress = (this.state.currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }

    isStepValid(step) {
        const a = this.state.answers;
        switch (step) {
            case 1: return !!a.country;
            case 2: return !!a.travelTiming;
            case 3: return true; // Calendar might have default selection or be optional
            case 4: return !!a.travellers;
            case 5: return !!a.budget;
            case 6: return true; // Final form needs validation logic but we'll enable submit for now
            default: return false;
        }
    }

    renderStep(step) {
        switch (step) {
            case 1: return this.stepTemplate1();
            case 2: return this.stepTemplate2();
            case 3: return this.stepTemplate3();
            case 4: return this.stepTemplate4();
            case 5: return this.stepTemplate5();
            case 6: return this.stepTemplate6();
            default: return '';
        }
    }

    // Step 1: Destination
    stepTemplate1() {
        const countries = ['Botswana', 'Kenya', 'Namibia', 'Rwanda', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe'];
        const options = countries.map(c => `
            <button class="dt-option-btn ${this.state.answers.country === c ? 'selected' : ''}" data-value="${c}">${c}</button>
        `).join('');

        return `
            <div class="dt-wizard-step">
                <h1 class="dt-wizard-heading">Where would you like to travel?</h1>
                <div class="dt-options-grid">
                    ${options}
                    <button class="dt-option-btn fallback ${this.state.answers.country === 'undecided' ? 'selected' : ''}" data-value="undecided">I HAVEN'T DECIDED YET</button>
                </div>
            </div>
        `;
    }

    // Step 2: Timing
    stepTemplate2() {
        const options = [
            { label: 'I KNOW EXACTLY WHEN', val: 'exactly' },
            { label: 'I HAVE A ROUGH IDEA', val: 'rough' },
            { label: 'TELL ME WHEN IS BEST', val: 'best' }
        ];
        const buttons = options.map(o => `
            <button class="dt-option-btn ${this.state.answers.travelTiming === o.val ? 'selected' : ''}" data-value="${o.val}">${o.label}</button>
        `).join('');

        return `
            <div class="dt-wizard-step">
                <h1 class="dt-wizard-heading">When would you like to travel?</h1>
                <div class="dt-options-grid single-col">
                    ${buttons}
                </div>
            </div>
        `;
    }

    // Step 3: Calendar (Two months view)
    stepTemplate3() {
        return `
            <div class="dt-wizard-step" style="max-width: 850px;">
                <h1 class="dt-wizard-heading">When would you like to travel?</h1>
                <div style="display: flex; gap: 40px; justify-content: center; margin-bottom: 30px;">
                    <!-- Month 1 -->
                    <div style="flex: 1;">
                        <h3 style="font-family: var(--dt-serif-font); font-weight: 400; font-size: 20px; margin-bottom: 20px;">Mar 26</h3>
                        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; font-size: 11px;">
                            <div style="opacity: 0.5;">MON</div><div style="opacity: 0.5;">TUE</div><div style="opacity: 0.5;">WED</div><div style="opacity: 0.5;">THU</div><div style="opacity: 0.5;">FRI</div><div style="opacity: 0.5;">SAT</div><div style="opacity: 0.5;">SUN</div>
                            ${Array.from({ length: 6 }, () => '<div></div>').join('')} <!-- Offset -->
                            <div style="padding: 8px;">1</div>
                            ${Array.from({ length: 30 }, (_, i) => {
            const day = i + 2;
            const isSelected = day === 14 || (day > 14 && day < 26) || day === 26;
            let style = 'padding: 8px; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin: 0 auto;';
            if (day === 14 || day === 26) style += 'background: rgba(255,255,255,0.3);';
            if (day > 14 && day < 26) style += 'background: rgba(255,255,255,0.1); border-radius: 0;';
            return `<div style="${style}">${day}</div>`;
        }).join('')}
                        </div>
                    </div>
                    <!-- Month 2 -->
                    <div style="flex: 1;">
                        <h3 style="font-family: var(--dt-serif-font); font-weight: 400; font-size: 20px; margin-bottom: 20px;">Apr 26</h3>
                        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; font-size: 11px;">
                            <div style="opacity: 0.5;">MON</div><div style="opacity: 0.5;">TUE</div><div style="opacity: 0.5;">WED</div><div style="opacity: 0.5;">THU</div><div style="opacity: 0.5;">FRI</div><div style="opacity: 0.5;">SAT</div><div style="opacity: 0.5;">SUN</div>
                            ${Array.from({ length: 2 }, () => '<div></div>').join('')} <!-- Offset -->
                            ${Array.from({ length: 30 }, (_, i) => `<div style="padding: 8px; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">${i + 1}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Step 4: Travellers
    stepTemplate4() {
        const options = ['COUPLE', 'SOLO', 'FAMILY', 'FRIENDS'];
        const buttons = options.map(o => `
            <button class="dt-option-btn ${this.state.answers.travellers === o ? 'selected' : ''}" data-value="${o}">${o}</button>
        `).join('');

        return `
            <div class="dt-wizard-step">
                <h1 class="dt-wizard-heading">Who are you travelling with?</h1>
                <div class="dt-options-grid" style="grid-template-columns: repeat(2, 1fr); max-width: 600px; margin: 0 auto;">
                    ${buttons}
                </div>
                <div class="dt-checkbox-group">
                    <label class="dt-checkbox-label">
                        <input type="checkbox" ${this.state.answers.isAgent ? 'checked' : ''} onchange="dtWizard.state.answers.isAgent = this.checked">
                        <span class="dt-custom-checkbox"></span>
                        I'm a trade agent enquiring for someone else
                    </label>
                    <label class="dt-checkbox-label">
                        <input type="checkbox" ${this.state.answers.isMedia ? 'checked' : ''} onchange="dtWizard.state.answers.isMedia = this.checked">
                        <span class="dt-custom-checkbox"></span>
                        I am enquiring for a media opportunity
                    </label>
                </div>
            </div>
        `;
    }

    // Step 5: Budget
    stepTemplate5() {
        const options = ['USD 7.5K - 10K', 'USD 10K - 20K', 'USD 20K - 40K', 'USD 40K+'];
        const buttons = options.map(o => `
            <button class="dt-option-btn ${this.state.answers.budget === o ? 'selected' : ''}" data-value="${o}">${o}</button>
        `).join('');

        return `
            <div class="dt-wizard-step">
                <h1 class="dt-wizard-heading">What is your travel budget per person?</h1>
                <div class="dt-options-grid single-col">
                    ${buttons}
                </div>
            </div>
        `;
    }

    // Step 6: Final Contact Form
    stepTemplate6() {
        return `
            <div class="dt-wizard-step" style="max-width: 500px; margin: 0 auto;">
                <h1 class="dt-wizard-heading">A few more details</h1>
                <div style="display: flex; flex-direction: column; gap: 15px; text-align: left;">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" placeholder="First Name" style="flex:1; padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
                        <input type="text" placeholder="Last Name" style="flex:1; padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
                    </div>
                    <input type="email" placeholder="Email Address" style="padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
                    <textarea placeholder="Tell us more about your ideal trip..." style="padding: 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; height: 100px;"></textarea>
                </div>
            </div>
        `;
    }

    closeWizard() {
        this.root.classList.remove('active');
        // Clear query param
        const url = new URL(window.location);
        url.searchParams.delete('_enquiry');
        window.history.pushState({}, '', url);
    }

    submitForm() {
        const nextBtn = document.getElementById('dt-next-btn');
        nextBtn.textContent = 'Submitting...';
        nextBtn.disabled = true;

        // Simulate fetch
        setTimeout(() => {
            document.getElementById('dt-step-container').innerHTML = `
                <div class="dt-wizard-step">
                    <h1 class="dt-wizard-heading">Thank you!</h1>
                    <p>Your enquiry has been submitted. One of our experts will be in touch shortly.</p>
                </div>
            `;
            document.querySelector('.dt-wizard-footer').style.display = 'none';
        }, 1500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dtWizard = new WizardApp();
});
