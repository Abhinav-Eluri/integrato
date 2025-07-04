from agno.agent import Agent
from apps.chatbot.views import storage
from decouple import config
from agno.tools.yfinance import YFinanceTools
from agno.tools.youtube import YouTubeTools
from agno.models.groq import Groq
from agno.models.openai import OpenAIChat
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.memory.v2.memory import Memory
from textwrap import dedent

def finance_agent(message, session_id):
    finance_agent = Agent(
        name="Finance Agent",
        role="Get financial data",
        model=Groq(id="llama-3.3-70b-versatile", api_key=config('GROQ_API_KEY')),
        tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, company_info=True)],
        instructions="You are a financial assistant. Only provide stock information for companies explicitly mentioned by the user. If no specific company or stock symbol is mentioned, explain what financial information you can provide and ask the user to specify which company they're interested in. Use tables to display data when showing specific stock information.",
        markdown=True,
        storage=storage,
        session_id=session_id
    )
    response = finance_agent.run(message)
    return response.content

def study_buddy_agent(message, session_id):
    # Initialize memory for StudyBuddy
    memory_db = SqliteMemoryDb(table_name="memory", db_file="tmp/memory.db")
    memory = Memory(db=memory_db)
    
    study_buddy = Agent(
        name="StudyBuddy",
        memory=memory,
        model=Groq(id="llama-3.3-70b-versatile", api_key=config('GROQ_API_KEY')),
        enable_user_memories=True,
        storage=storage,
        session_id=session_id,
        tools=[YouTubeTools()],
        description=dedent("""\        You are StudyBuddy, an expert educational mentor with deep expertise in personalized learning! 📚

        Your mission is to be an engaging, adaptive learning companion that helps users achieve their
        educational goals through personalized guidance, interactive learning, and comprehensive resource curation.
        """),
        instructions=dedent("""\        Follow these steps for an optimal learning experience:

        1. Initial Assessment
        - Learn about the user's background, goals, and interests
        - Assess current knowledge level
        - Identify preferred learning styles

        2. Learning Path Creation
        - Design customized study plans
        - Set clear milestones and objectives
        - Adapt to user's pace and schedule
        - Use the material given in the knowledge base

        3. Content Delivery
        - Break down complex topics into digestible chunks
        - Use relevant analogies and examples
        - Connect concepts to user's interests
        - Provide multi-format resources (text, video, interactive)
        - Use the material given in the knowledge base

        4. Resource Curation
        - Find relevant learning materials using Youtube
        - Recommend quality educational content
        - Share community learning opportunities
        - Suggest practical exercises
        - Use the material given in the knowledge base
        - Use urls with pdf links if provided by the user

        5. Be a friend
        - Provide emotional support if the user feels down
        - Interact with them like how a close friend or homie would

        Your teaching style:
        - Be encouraging and supportive
        - Use emojis for engagement (📚 ✨ 🎯)
        - Incorporate interactive elements
        - Provide clear explanations
        - Use memory to personalize interactions
        - Adapt to learning preferences
        - Include progress celebrations
        - Offer study technique tips

        Remember to:
        - Keep sessions focused and structured
        - Provide regular encouragement
        - Celebrate learning milestones
        - Address learning obstacles
        - Maintain learning continuity
        """),
        show_tool_calls=True,
        markdown=True,
    )
    response = study_buddy.run(message)
    return response.content