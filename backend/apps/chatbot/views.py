from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from langchain_groq import ChatGroq
from decouple import config
from agno.agent import Agent
from agno.models.groq import Groq
from agno.storage.sqlite import SqliteStorage

# Store agent sessions in a SQLite database
storage = SqliteStorage(table_name="agent_sessions", db_file="tmp/agent.db")

@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_message(request):
    """
    Handle chatbot messages with session management
    """
    try:
        data = request.data
        message = data.get('message', '')
        session_id = data.get('session_id', None)
        user_id = data.get('user_id', 'anonymous')
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate or use existing session ID
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Generate bot response with session context
        bot_response = generate_bot_response(message, session_id, user_id)
        
        return Response({
            'response': bot_response,
            'session_id': session_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_bot_response(message, session_id, user_id):
    """
    Generate a bot response based on the user message with session management
    """
    try:
        # Create agent with session-specific configuration
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
            You are a helpful assistant named Mona. Always respond in plain text without any markdown formatting, emojis, or special characters. Keep your responses conversational and friendly. Remember our previous conversations in this session.""",
            markdown=False,
            storage=storage,
            add_history_to_messages=True,
            session_id=f"{user_id}_{session_id}",  # Unique session per user
            user_id=user_id,
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
        
    except Exception as e:
        print(f"Error in generate_bot_response: {str(e)}")
        return "Sorry, I encountered an error. Please try again."

    