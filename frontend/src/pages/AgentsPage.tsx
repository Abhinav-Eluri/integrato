import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, PaperAirplaneIcon, CpuChipIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import { AgentsService } from '@/services';
import FinancialDataDisplay from '@/components/FinancialDataDisplay';
import StudyBuddyDisplay from '@/components/StudyBuddyDisplay';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const agents: Agent[] = [
  {
    id: 'finance',
    name: 'Finance Agent',
    description: 'Expert in financial analysis, budgeting, and investment advice',
    icon: CpuChipIcon,
  },
  {
    id: 'study_buddy',
    name: 'StudyBuddy',
    description: 'Your personalized learning companion for educational guidance and study support 📚',
    icon: AcademicCapIcon,
  },
];

const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm the ${selectedAgent.name}. ${selectedAgent.description}. How can I help you today?`,
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset messages when agent changes
    setMessages([
      {
        id: '1',
        content: `Hello! I'm the ${selectedAgent.name}. ${selectedAgent.description}. How can I help you today?`,
        sender: 'agent',
        timestamp: new Date(),
      },
    ]);
  }, [selectedAgent]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to the backend via AgentsService
      const response = await AgentsService.sendMessage(userMessage.content, selectedAgent.id);
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error sending message to agent:', error);
      
      // Fallback response in case of error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I'm having trouble connecting to the server right now. Please try again later.`,
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <CpuChipIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Agents
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chat with specialized AI agents
              </p>
            </div>
          </div>

          {/* Agent Selector */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
              <selectedAgent.icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedAgent.name}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {agents.map((agent) => (
                <Menu.Item key={agent.id}>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className={cn(
                        'flex items-start w-full px-4 py-3 text-left transition-colors',
                        active
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : '',
                        selectedAgent.id === agent.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <agent.icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {agent.description}
                        </div>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex w-full',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-2xl px-4 py-3 rounded-2xl shadow-sm',
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                )}
              >
                {message.sender === 'agent' && selectedAgent.id === 'finance' ? (
                  <FinancialDataDisplay content={message.content} />
                ) : message.sender === 'agent' && selectedAgent.id === 'study_buddy' ? (
                  <StudyBuddyDisplay content={message.content} />
                ) : (
                  <p className={cn(
                    "text-sm leading-relaxed",
                    message.sender === 'user' 
                      ? "text-white" 
                      : "text-gray-900 dark:text-white"
                  )}>{message.content}</p>
                )}
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${selectedAgent.name} anything...`}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 rounded-xl h-11 flex items-center justify-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;