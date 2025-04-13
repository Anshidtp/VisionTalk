import logging
import google.generativeai as genai
from app.core.exceptions import ServiceError

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Google's Gemini API."""
    
    def __init__(self, api_key: str):
        """Initialize Gemini API."""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        logger.info("Gemini service initialized")
    
    def generate_response(self, context: str, query: str) -> str:
        """Generate a response using Google Gemini API."""
        logger.info(f"Generating response for query: {query[:50]}...")
        
        try:
            # Check for empty context
            if not context or len(context) < 10:
                return "Error: No document content available to answer your question."
                
            # Create a prompt with the document content and query
            prompt = f"""I have a document with the following content:

                        {context}

                        Based on this document, please answer the following question:
                        {query}

                        If you can find information related to the query in the document, please answer based on that information.
                        If the document doesn't specifically mention the exact information asked, please try to infer from related content or clearly state that the specific information isn't available in the document.
                        """
            
            # Generate response
            model = genai.GenerativeModel('gemma-3-27b-it')
            
            generation_config = {
                "temperature": 0.4,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
            
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
            ]
            
            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            logger.info("Response generated successfully")
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Error generating response: {str(e)}"