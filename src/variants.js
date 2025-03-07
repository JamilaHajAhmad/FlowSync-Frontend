export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export const slideInFromLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export const slideInFromRight = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export const bounce = {
    hidden: { y: -20, opacity: 0 },
    visible: {
        y: [ 0, -10, 0 ],
        opacity: 1,
        transition: { duration: 0.6, ease: "easeInOut", repeat: 1 }
    },
};

export const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const rotate = {
    hidden: { rotate: -180, opacity: 0 },
    visible: { rotate: 0, opacity: 1, transition: { duration: 1, ease: "easeOut" } },
};

export const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    },
};

export const fadeUp = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" }
    },
};

export const homeMotion = {
    hidden: { opacity: 0, y: 50 }, // Start lower and invisible
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }
    }
};

export const navbarMotion = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const heroTitleMotion = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};


export const buttonMotion = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut", type: "spring", stiffness: 100 } }
};

export const imageMotion = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const backgroundMotion = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 2, ease: "easeInOut" } }
};

export const registerVariants = {
    hidden: {
        opacity: 0,
        x: -100,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 2,
        },
    },
};


