import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send,
  Bot,
  User,
  Loader2,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

const AIChat = ({ apiUrl }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI assistant for affordable housing project management. I can help you with:\n\n• Project status and funding information\n• Application deadlines and requirements\n• Document organization and compliance\n• Financial analysis and projections\n• Stakeholder communication\n\nWhat would you like to know about your projects?",
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chat_history: chatHistory
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setChatHistory(prev => [...prev, 
          { role: 'user', content: inputMessage },
          { role: 'assistant', content: data.response }
        ]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    {
      icon: <Building2 className="h-4 w-4" />,
      text: "What's the status of Dallas Mill Station?",
      category: "Project Status"
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      text: "Show me all funding applications due this month",
      category: "Funding"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "What are the upcoming deadlines?",
      category: "Deadlines"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Help me organize LIHTC application documents",
      category: "Documents"
    }
  ];

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-brand-red text-white' 
            : message.isError 
              ? 'bg-red-100 text-red-600'
              : 'bg-brand-teal text-white'
        }`}>
          {message.type === 'user' ? <User className="h-4 w-4" /> : 
           message.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={`rounded-lg px-4 py-2 ${
          message.type === 'user' 
            ? 'bg-brand-red text-white' 
            : message.isError
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          <div className={`text-xs mt-1 ${
            message.type === 'user' 
              ? 'text-red-100' 
              : message.isError 
                ? 'text-red-500'
                : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">AI Assistant</h1>
          <p className="text-gray-600 mt-1">Get intelligent insights about your projects and funding</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Questions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-brand-teal" />
                Quick Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left h-auto p-3 hover:bg-gray-50"
                  onClick={() => setInputMessage(question.text)}
                >
                  <div className="flex items-start gap-2">
                    <div className="text-brand-teal mt-0.5">
                      {question.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {question.text}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {question.category}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-teal" />
                  <span>Project Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-brand-teal" />
                  <span>Funding Strategy</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-teal" />
                  <span>Document Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-teal" />
                  <span>Timeline Planning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-brand-red" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            
            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-brand-teal" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your projects..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-brand-red hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-teal" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-brand-red" />
                <h3 className="font-semibold">Project Intelligence</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get AI-powered analysis of project status, risks, and opportunities across your portfolio.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-brand-teal" />
                <h3 className="font-semibold">Funding Optimization</h3>
              </div>
              <p className="text-sm text-gray-600">
                Receive strategic recommendations for funding source combinations and application timing.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-brand-blue-gray" />
                <h3 className="font-semibold">Document Intelligence</h3>
              </div>
              <p className="text-sm text-gray-600">
                Automatically organize and analyze documents for compliance and completeness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;

