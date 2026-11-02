import React from 'react';
import { Flame, Trophy, TrendingUp, Sparkles, Award } from 'lucide-react';

const Trending = () => {
  const leaderboard = [
    { rank: 1, title: 'SolarFlow: Low-Cost Solar Thermal Tracker', author: 'Zainab Bilal', score: 980, category: 'Renewable Tech' },
    { rank: 2, title: 'EcoSort AI: Smart Campus Recycling Bin', author: 'Ayesha Khan', score: 875, category: 'Computer Vision' },
    { rank: 3, title: 'PeerSync: Real-Time Youth Skill Barter', author: 'Hamza Tariq', score: 760, category: 'EdTech' },
    { rank: 4, title: 'Automated Agro-Drone Crop Health Inspector', author: 'Usman Ali', score: 690, category: 'AgriTech' },
    { rank: 5, title: 'Urdu Voice-To-Text Healthcare Assistant', author: 'Maryam Nawaz', score: 620, category: 'NLP / Health' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-accent-pink text-xs font-semibold mb-3 border border-rose-500/20">
          <Flame className="w-4 h-4" />
          <span>Community Innovation Leaderboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Top & Trending <span className="text-gradient-accent">Innovations</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Ranked live based on community upvotes, peer review feedback, and impact viability
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card-dark">
        <div className="space-y-4">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.rank === 1
                      ? 'bg-amber-400 text-black shadow-glow-sm'
                      : item.rank === 2
                      ? 'bg-slate-300 text-black'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.rank === 1 ? <Trophy className="w-4 h-4" /> : `#${item.rank}`}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base hover:text-indigo-400 cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>By {item.author}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-sm font-bold text-accent-fuchsia">
                <TrendingUp className="w-4 h-4" />
                <span>{item.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
