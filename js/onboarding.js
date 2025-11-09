// Onboarding tutorial for new users
import { getCurrentUser, isLoggedIn } from './auth.js';
import { showMessage } from './utils.js';

const ONBOARDING_COMPLETE_KEY = 'pastlife_onboarding_complete';
const ONBOARDING_STEP_KEY = 'pastlife_onboarding_step';

// Check if user has completed onboarding
export function hasCompletedOnboarding() {
    const user = getCurrentUser();
    if (!user) return true; // Don't show onboarding if not logged in
    
    const key = `${ONBOARDING_COMPLETE_KEY}_${user.username}`;
    return localStorage.getItem(key) === 'true';
}

// Mark onboarding as complete
export function completeOnboarding() {
    const user = getCurrentUser();
    if (!user) return;
    
    const key = `${ONBOARDING_COMPLETE_KEY}_${user.username}`;
    localStorage.setItem(key, 'true');
}

// Get current onboarding step
export function getOnboardingStep() {
    const user = getCurrentUser();
    if (!user) return 0;
    
    const key = `${ONBOARDING_STEP_KEY}_${user.username}`;
    return parseInt(localStorage.getItem(key) || '0');
}

// Set onboarding step
export function setOnboardingStep(step) {
    const user = getCurrentUser();
    if (!user) return;
    
    const key = `${ONBOARDING_STEP_KEY}_${user.username}`;
    localStorage.setItem(key, step.toString());
}

// Show onboarding tutorial
export function showOnboarding() {
    if (!isLoggedIn()) return;
    if (hasCompletedOnboarding()) return;
    
    const step = getOnboardingStep();
    
    // Create onboarding overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s;
    `;
    
    const steps = [
        {
            title: 'Velkommen til PastLife! 👋',
            content: 'PastLife er en plattform for å oppdage og dele informasjon om dine forfedre. La oss ta en rask gjennomgang av hovedfunksjonene.',
            position: 'center'
        },
        {
            title: 'Legg til forfedre 📝',
            content: 'Gå til "Profile"-siden for å legge til informasjon om dine forfedre. Du kan legge til navn, fødselsår, sted, beskrivelse, bilder og mer.',
            position: 'top',
            highlight: 'nav a[href="profile.html"]'
        },
        {
            title: 'Bygg familietre 🌳',
            content: 'Gå til "Family Tree"-siden og lim inn tekst om familien din. AI-en vil analysere teksten og bygge et familietre automatisk.',
            position: 'top',
            highlight: 'nav a[href="family-tree.html"]'
        },
        {
            title: 'Søk og utforsk 🔍',
            content: 'Bruk søkefunksjonen for å finne personer etter navn, sted, år, eller relasjoner. Du kan også se alle personer på "Search"-siden.',
            position: 'top',
            highlight: 'nav a[href="search.html"]'
        },
        {
            title: 'Kommenter og del 💬',
            content: 'Legg til kommentarer på personer for å dele historier og informasjon. Du kan også favorisere personer og dele dem med andre.',
            position: 'center'
        },
        {
            title: 'Eksporter og sikkerhetskopier 💾',
            content: 'På Profile-siden kan du eksportere data til JSON eller CSV, og lage fullstendige sikkerhetskopier av all din data.',
            position: 'center'
        },
        {
            title: 'Klar til å begynne! 🎉',
            content: 'Du er nå klar til å begynne å utforske din familiehistorie. Lykke til med slektsforskningen!',
            position: 'center'
        }
    ];
    
    if (step >= steps.length) {
        completeOnboarding();
        return;
    }
    
    const currentStep = steps[step];
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--white);
        border-radius: 15px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        position: relative;
        animation: slideIn 0.3s;
    `;
    
    modal.innerHTML = `
        <h2 style="color: var(--turquoise-dark); margin-bottom: 1rem; font-size: 1.5rem;">${currentStep.title}</h2>
        <p style="color: var(--text-dark); line-height: 1.6; margin-bottom: 2rem;">${currentStep.content}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="color: var(--gray-dark); font-size: 0.9rem;">
                Steg ${step + 1} av ${steps.length}
            </div>
            <div style="display: flex; gap: 1rem;">
                ${step > 0 ? `
                    <button id="onboardingPrev" style="
                        padding: 0.75rem 1.5rem;
                        background: var(--gray-light);
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-dark);
                        font-weight: bold;
                    ">← Forrige</button>
                ` : ''}
                <button id="onboardingNext" style="
                    padding: 0.75rem 1.5rem;
                    background: var(--turquoise-primary);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    color: white;
                    font-weight: bold;
                ">${step === steps.length - 1 ? 'Ferdig ✓' : 'Neste →'}</button>
            </div>
        </div>
        ${step < steps.length - 1 ? `
            <button id="onboardingSkip" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: transparent;
                border: none;
                cursor: pointer;
                color: var(--gray-dark);
                font-size: 0.9rem;
                text-decoration: underline;
            ">Hopp over tutorial</button>
        ` : ''}
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Highlight element if specified
    if (currentStep.highlight) {
        const element = document.querySelector(currentStep.highlight);
        if (element) {
            element.style.cssText += `
                position: relative;
                z-index: 10001;
                box-shadow: 0 0 0 4px var(--orange-primary), 0 0 20px rgba(255, 140, 0, 0.5);
                border-radius: 5px;
            `;
        }
    }
    
    // Event listeners
    document.getElementById('onboardingNext').addEventListener('click', () => {
        if (step === steps.length - 1) {
            completeOnboarding();
            overlay.remove();
            if (currentStep.highlight) {
                const element = document.querySelector(currentStep.highlight);
                if (element) element.style.boxShadow = '';
            }
            showMessage('Takk for at du tok tiden til å lære om PastLife!', 'success');
        } else {
            setOnboardingStep(step + 1);
            overlay.remove();
            if (currentStep.highlight) {
                const element = document.querySelector(currentStep.highlight);
                if (element) element.style.boxShadow = '';
            }
            setTimeout(() => showOnboarding(), 300);
        }
    });
    
    if (step > 0) {
        document.getElementById('onboardingPrev').addEventListener('click', () => {
            setOnboardingStep(step - 1);
            overlay.remove();
            if (currentStep.highlight) {
                const element = document.querySelector(currentStep.highlight);
                if (element) element.style.boxShadow = '';
            }
            setTimeout(() => showOnboarding(), 300);
        });
    }
    
    if (step < steps.length - 1) {
        document.getElementById('onboardingSkip').addEventListener('click', () => {
            if (confirm('Er du sikker på at du vil hoppe over tutorialen? Du kan alltid se den igjen senere.')) {
                completeOnboarding();
                overlay.remove();
                if (currentStep.highlight) {
                    const element = document.querySelector(currentStep.highlight);
                    if (element) element.style.boxShadow = '';
                }
            }
        });
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            // Don't close on overlay click, require button click
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

