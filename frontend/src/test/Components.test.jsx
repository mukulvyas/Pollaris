import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BottomNav from '../components/BottomNav';
import MicButton from '../components/MicButton';
import SpeakerButton from '../components/SpeakerButton';
import TimelineItem from '../components/TimelineItem';

// ── BottomNav ──────────────────────────────────────────────────────────────
describe('BottomNav', () => {
  it('renders all 5 navigation tabs', () => {
    render(<BrowserRouter><BottomNav /></BrowserRouter>);
    expect(screen.getByText('HOME')).toBeDefined();
    expect(screen.getByText('MAP')).toBeDefined();
    expect(screen.getByText('CANDIDATES')).toBeDefined();
    expect(screen.getByText('GUIDE')).toBeDefined();
    expect(screen.getByText('HELP')).toBeDefined();
  });

  it('has correct IDs on nav links for testability', () => {
    render(<BrowserRouter><BottomNav /></BrowserRouter>);
    expect(document.getElementById('nav-home')).toBeTruthy();
    expect(document.getElementById('nav-map')).toBeTruthy();
    expect(document.getElementById('nav-guide')).toBeTruthy();
  });
});

// ── MicButton ──────────────────────────────────────────────────────────────
describe('MicButton', () => {
  it('shows correct aria-label when idle', () => {
    render(<MicButton isListening={false} onClick={() => {}} />);
    const btn = document.getElementById('mic-button');
    expect(btn.getAttribute('aria-label')).toBe('Start voice input');
  });

  it('shows correct aria-label when listening', () => {
    render(<MicButton isListening={true} onClick={() => {}} />);
    const btn = document.getElementById('mic-button');
    expect(btn.getAttribute('aria-label')).toBe('Stop listening');
  });

  it('calls onClick when clicked', () => {
    const mockFn = vi.fn();
    render(<MicButton isListening={false} onClick={mockFn} />);
    fireEvent.click(document.getElementById('mic-button'));
    expect(mockFn).toHaveBeenCalledOnce();
  });
});

// ── SpeakerButton ───────────────────────────────────────────────────────────
describe('SpeakerButton', () => {
  it('shows Read aloud label when not speaking', () => {
    render(<SpeakerButton isSpeaking={false} onClick={() => {}} />);
    const btn = document.getElementById('speaker-button');
    expect(btn.getAttribute('aria-label')).toBe('Read aloud');
    expect(screen.getByText(/speaker/i)).toBeDefined();
  });

  it('shows Stop label when speaking', () => {
    render(<SpeakerButton isSpeaking={true} onClick={() => {}} />);
    const btn = document.getElementById('speaker-button');
    expect(btn.getAttribute('aria-label')).toBe('Stop speaking');
    expect(screen.getByText('Stop')).toBeDefined();
  });
});

// ── TimelineItem ────────────────────────────────────────────────────────────
describe('TimelineItem', () => {
  const mockStep = {
    title: 'Voting Day',
    date: 'MAY 20, 2024',
    desc: 'Cast your vote. Opens at 7:00 AM.',
    status: 'current',
  };

  it('renders step title and date', () => {
    render(
      <BrowserRouter>
        <TimelineItem step={mockStep} index={0} isLast={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('Voting Day')).toBeDefined();
    expect(screen.getByText('MAY 20, 2024')).toBeDefined();
  });

  it('renders step description', () => {
    render(
      <BrowserRouter>
        <TimelineItem step={mockStep} index={0} isLast={false} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Cast your vote/)).toBeDefined();
  });
});
