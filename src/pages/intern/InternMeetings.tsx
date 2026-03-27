import React from 'react';
import { mockMeetings } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Video, ExternalLink } from 'lucide-react';

const InternMeetings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
      <p className="text-muted-foreground mt-1">Upcoming scheduled meetings</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockMeetings.map(m => {
        let link = m.link;
        if (link.includes('localhost')) {
          link = link.replace(/https?:\/\/localhost(:\d+)?/, 'https://meet.google.com');
        }
        if (!link.includes('meet.google.com')) {
          link = `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`;
        }
        return (
          <Card key={m.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.date} at {m.time}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                Join Meeting <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

export default InternMeetings;
