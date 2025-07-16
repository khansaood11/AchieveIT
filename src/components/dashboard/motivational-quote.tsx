'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const quotes = [
  "The secret of getting ahead is getting started.",
  "Believe you can and you're halfway there.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The best way to predict the future is to create it.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export const MotivationalQuote = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center italic text-muted-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
};
