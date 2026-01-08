/**
 * Formats a phone number for WhatsApp API (e.g., removes non-digits, adds country code if missing)
 * Defaulting to India (+91) if no country code provided.
 */
export const formatPhoneForWhatsapp = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');

    // If number is 10 digits, assume India (+91)
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    return cleaned;
};

/**
 * Generates a WhatsApp deep link with a pre-filled message
 */
export const generateWhatsappLink = (phone: string, message: string): string => {
    const formattedPhone = formatPhoneForWhatsapp(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Generates a standard payment reminder message
 */
export const generatePaymentReminderMessage = (
    amount: number,
    contactName: string,
    merchantName: string = 'me'
): string => {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    return `Hello ${contactName}, this is a gentle reminder that a payment of ${formattedAmount} is pending for ${merchantName}. Please pay at your earliest convenience. Thank you!`;
};

/**
 * Generates a balance update message (for when I gave money/credit)
 */
export const generateBalanceUpdateMessage = (
    balance: number,
    type: 'TO_GIVE' | 'TO_TAKE'
): string => {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(balance));

    if (type === 'TO_TAKE') {
        return `Hi, just updating our records. Total pending amount to receive from you is ${formattedAmount}.`;
    } else {
        return `Hi, just updating our records. Total pending amount I need to give you is ${formattedAmount}.`;
    }
};
