document.addEventListener('DOMContentLoaded', () => {
    console.log("Ondili platform initialized.");
    
    // Add interactive hover effect to the hero card
    const heroCard = document.querySelector('.hero');
    
    heroCard.addEventListener('mousemove', (e) => {
        const rect = heroCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Slight tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (y - centerY) / 20;
        const tiltY = (centerX - x) / 20;
        
        heroCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });
    
    heroCard.addEventListener('mouseleave', () => {
        heroCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        heroCard.style.transition = 'transform 0.5s ease-out';
    });
    
    heroCard.addEventListener('mouseenter', () => {
        heroCard.style.transition = 'none'; // Remove transition during mousemove for crisp response
    });
});
