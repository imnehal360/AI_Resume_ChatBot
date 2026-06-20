const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF buffer.
 * @param {Buffer} dataBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
exports.parseResumePdf = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        // Simple cleanup: remove excessive newlines/spaces if needed, 
        // but LLMs are usually good at handling raw text.
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF file.");
    }
};
