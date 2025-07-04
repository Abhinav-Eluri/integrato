from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import uuid
from .agents import finance_agent, study_buddy_agent


@api_view(['POST'])
@permission_classes([AllowAny])
def agent_chat(request):
    """
    Handle agent chat messages with session management
    """
    try:
        data = request.data
        message = data.get('message', '')
        agent_type = data.get('agent_type', 'finance')
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
        
        # TODO: Implement agent-specific response generation
        # This method is kept empty as requested by the user
        agent_response = generate_agent_response(message, agent_type, session_id, user_id)
        
        return Response({
            'response': agent_response,
            'session_id': session_id,
            'agent_type': agent_type
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_agent_response(message, agent_type, session_id, user_id):
    """
    Generate an agent response based on the user message and agent type
    This method is kept empty as requested - backend implementation to be added later
    """
    if agent_type == 'finance':
        return finance_agent(message, session_id)
    elif agent_type == 'study_buddy':
        return study_buddy_agent(message, session_id)
    
    # TODO: Implement agent-specific logic here
    # For now, return a placeholder response for other agent types
    return f"Hello! I'm a {agent_type} agent. You said: {message}"