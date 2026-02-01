export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GroqService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private workingModel: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('VITE_GROQ_API_KEY environment variable not set');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private availableModels = [
    'llama-3.1-8b-instant',
    'llama-3.1-70b-versatile',
    'llama3-70b-8192',
    'gemma-7b-it',
    'gemma2-9b-it'
  ];

  async findWorkingModel(): Promise<string> {
    if (this.workingModel) {
      return this.workingModel;
    }

    for (const model of this.availableModels) {
      try {
        console.log(`Testing model: ${model}`);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hi' }],
            model: model,
            temperature: 0.7,
            max_tokens: 10,
            stream: false
          })
        });

        if (response.ok) {
          console.log(`Working model found: ${model}`);
          this.workingModel = model;
          return model;
        } else {
          const errorData = await response.text();
          console.log(`Model ${model} failed:`, errorData);
        }
      } catch (error) {
        console.log(`Model ${model} error:`, error);
      }
    }
    
    throw new Error('No working model found');
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection and finding working model...');
      
      const workingModel = await this.findWorkingModel();
      console.log('Found working model:', workingModel);
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const model = await this.findWorkingModel();
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: model,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Failed to get response from Groq API: ${error.message}`);
    }
  }

  async streamMessage(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      const model = await this.findWorkingModel();
      console.log('Making Groq API call with model:', model);
      
      const requestBody = {
        messages: messages,
        model: model,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      console.log('Stream response received');

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (data === '') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.log('Skipping invalid JSON line:', data);
              continue;
            }
          }
        }
      }
      
      console.log('Stream completed successfully');
    } catch (error) {
      console.error('Groq API streaming error details:', error);
      console.error('Error message:', error.message);
      throw new Error(`Failed to stream response from Groq API: ${error.message}`);
    }
  }
}

export const groqService = new GroqService();