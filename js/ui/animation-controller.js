/**
 * Animation Controller - Centralized animation management for game UI
 * Handles pawn movement, visual feedback, and animation queuing
 */

class AnimationController {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.animationConfig = {
            pawnMovement: {
                duration: 225,
                easing: 'ease-out'
            },
            highlight: {
                duration: 150,
                easing: 'ease-in-out'
            },
            shake: {
                duration: 300,
                intensity: 8,
                frequency: 4
            }
        };
    }

    /**
     * Queue an animation to prevent conflicts
     * @param {Function} animationFn - Function that performs the animation
     * @returns {Promise} Promise that resolves when animation completes
     */
    queueAnimation(animationFn) {
        return new Promise((resolve, reject) => {
            this.animationQueue.push({ animationFn, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Process the animation queue sequentially
     */
    async processQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) {
            return;
        }

        this.isAnimating = true;
        const { animationFn, resolve, reject } = this.animationQueue.shift();

        try {
            await animationFn();
            resolve();
        } catch (error) {
            reject(error);
        }

        this.isAnimating = false;
        this.processQueue();
    }

    /**
     * Animate pawn movement from one position to another
     * @param {HTMLElement} pawnElement - The pawn element to animate
     * @param {Object} fromPos - Starting position {row, col}
     * @param {Object} toPos - Target position {row, col}
     * @returns {Promise} Promise that resolves when animation completes
     */
    animatePawnMovement(pawnElement, fromPos, toPos) {
        return this.queueAnimation(() => {
            return new Promise((resolve) => {
                const fromCard = document.querySelector(`[data-row="${fromPos.row}"][data-col="${fromPos.col}"]`);
                const toCard = document.querySelector(`[data-row="${toPos.row}"][data-col="${toPos.col}"]`);

                if (!fromCard || !toCard) {
                    resolve();
                    return;
                }

                const fromRect = fromCard.getBoundingClientRect();
                const toRect = toCard.getBoundingClientRect();

                const deltaX = toRect.left - fromRect.left;
                const deltaY = toRect.top - fromRect.top;

                // Apply transform
                pawnElement.style.transition = `transform ${this.animationConfig.pawnMovement.duration}ms ${this.animationConfig.pawnMovement.easing}`;
                pawnElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                // Clean up after animation
                setTimeout(() => {
                    pawnElement.style.transition = '';
                    pawnElement.style.transform = '';
                    resolve();
                }, this.animationConfig.pawnMovement.duration);
            });
        });
    }

    /**
     * Create shake animation for invalid moves using CSS animation
     * @param {HTMLElement} element - Element to shake
     * @returns {Promise} Promise that resolves when shake completes
     */
    shakeElement(element) {
        return this.queueAnimation(() => {
            return new Promise((resolve) => {
                element.classList.add('shake-animation');
                
                const handleAnimationEnd = () => {
                    element.classList.remove('shake-animation');
                    element.removeEventListener('animationend', handleAnimationEnd);
                    resolve();
                };
                
                element.addEventListener('animationend', handleAnimationEnd);
                
                // Fallback timeout in case animationend doesn't fire
                setTimeout(() => {
                    if (element.classList.contains('shake-animation')) {
                        element.classList.remove('shake-animation');
                        element.removeEventListener('animationend', handleAnimationEnd);
                        resolve();
                    }
                }, this.animationConfig.shake.duration + 50);
            });
        });
    }

    /**
     * Highlight element with smooth transition
     * @param {HTMLElement} element - Element to highlight
     * @param {string} highlightClass - CSS class for highlight style
     */
    highlightElement(element, highlightClass) {
        element.style.transition = `all ${this.animationConfig.highlight.duration}ms ${this.animationConfig.highlight.easing}`;
        element.classList.add(highlightClass);
    }

    /**
     * Remove highlight from element
     * @param {HTMLElement} element - Element to unhighlight
     * @param {string} highlightClass - CSS class to remove
     */
    unhighlightElement(element, highlightClass) {
        element.style.transition = `all ${this.animationConfig.highlight.duration}ms ${this.animationConfig.highlight.easing}`;
        element.classList.remove(highlightClass);
        
        // Clean up transition style after animation
        setTimeout(() => {
            element.style.transition = '';
        }, this.animationConfig.highlight.duration);
    }

    /**
     * Update visual state of collapsed cards with animation
     * @param {HTMLElement} cardElement - Card element to mark as collapsed
     * @returns {Promise} Promise that resolves when collapse animation completes
     */
    markCardAsCollapsed(cardElement) {
        return this.queueAnimation(() => {
            return new Promise((resolve) => {
                // First add collapsing class for animation
                cardElement.classList.add('card-collapsing');
                
                // After collapsing animation, add final collapsed state
                setTimeout(() => {
                    cardElement.classList.remove('card-collapsing');
                    cardElement.classList.add('collapsed');
                    resolve();
                }, 250); // matches --animation-normal duration
            });
        });
    }

    /**
     * Animate multiple cards collapsing in sequence
     * @param {HTMLElement[]} cardElements - Array of card elements to collapse
     * @param {number} staggerDelay - Delay between each card collapse in ms
     * @returns {Promise} Promise that resolves when all cards are collapsed
     */
    collapseCardsSequentially(cardElements, staggerDelay = 100) {
        return new Promise(async (resolve) => {
            const promises = cardElements.map((cardElement, index) => {
                return new Promise((cardResolve) => {
                    setTimeout(() => {
                        this.markCardAsCollapsed(cardElement).then(cardResolve);
                    }, index * staggerDelay);
                });
            });
            
            await Promise.all(promises);
            resolve();
        });
    }

    /**
     * Clear all queued animations (emergency stop)
     */
    clearQueue() {
        this.animationQueue.forEach(({ reject }) => {
            reject(new Error('Animation cancelled'));
        });
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * Check if animations are currently running
     * @returns {boolean} True if animations are running
     */
    isRunning() {
        return this.isAnimating || this.animationQueue.length > 0;
    }
}

// Export singleton instance
export const animationController = new AnimationController();