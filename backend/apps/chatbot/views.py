from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
import json
from langchain_groq import ChatGroq
from decouple import config
from agno.agent import Agent
from agno.models.groq import Groq

messages = [
    {"role": "system", "content": "You are a helpful ai assistant named Mona. Always respond in plain text without any markdown formatting, emojis, or special characters. Keep your responses conversational and friendly."},
]

@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_message(request):
    """
    Handle chatbot messages
    """
    try:
        data = request.data
        message = data.get('message', '')
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple chatbot logic - you can replace this with AI/ML integration
        bot_response = generate_bot_response(message)
        
        return Response({
            'response': bot_response
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_bot_response(message):
    """
    Generate a bot response based on the user message
    This is a simple implementation - replace with your AI/ML logic
    """
    messages.append({"role": "user", "content": message})    
    agent = Agent(
        model=Groq(
            id="gemma2-9b-it",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            api_key=config('GROQ_API_KEY')
        ),
        description="A chatbot that responds to user messages",
        instructions="""
        You are a helpful assistant named Mona. Always respond in plain text without any markdown formatting, emojis, or special characters. Keep your responses conversational and friendly.""",
        markdown=False
    )
    response = agent.run(message)

    # Extract the content from the response
    if hasattr(response, 'content'):
        return response.content
    elif hasattr(response, 'messages') and response.messages:
        # Get the last message content
        last_message = response.messages[-1]
        if hasattr(last_message, 'content'):
            return last_message.content
    
    return str(response)

    