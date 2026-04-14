// Comprehensive date validation and sanitization code

(function() {
    const originalDate = Date;

    // Wrapper for Date constructor
    window.Date = function(...args) {
        if (args.length === 0) return new originalDate();
        const date = new originalDate(...args);
        return date instanceof originalDate ? date : null;
    };

    window.Date.prototype = originalDate.prototype;
    window.Date.now = originalDate.now;

    /* Function to validate and sanitize dates */
    const validateAndSanitizeDate = (input) => {
        if (input === null || input === undefined || input === '') {
            return null;
        }
        if (input instanceof originalDate) {
            return input;
        }
        const parsedDate = new originalDate(input);
        if (isNaN(parsedDate.getTime())) {
            return null; // Invalid date
        }
        return parsedDate;
    };

    // Expose the function to the global scope
    window.validateAndSanitizeDate = validateAndSanitizeDate;
})();
