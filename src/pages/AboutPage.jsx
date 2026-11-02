import React from 'react';
import { Compass, Sparkles, Award } from 'lucide-react';
import '../styles/About.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      
      {/* 1. HERO HEADER */}
      <section className="about-hero-section">
        <div className="about-hero-inner">
          <span className="about-hero-badge">
            Lahore Leads University • Youth Innovation Platform
          </span>
          <h1 className="about-hero-title">Beyond the Thought.</h1>
          <p className="about-hero-subtitle">
            SochX is the strike-point where bold ideas meet the teams that build them. We aren't here for academic exercises; we are here to mobilize the next generation of global impact.
          </p>
        </div>
      </section>

      {/* 2. MISSION & VISION DUAL CARDS */}
      <section className="about-dual-section">
        <div className="about-dual-grid">
          {/* Card 1 */}
          <div className="about-dual-card">
            <span className="about-card-badge">THE MISSION</span>
            <h2 className="about-card-title">Mobilize Youth.</h2>
            <p className="about-card-desc">
              To provide a high-octane launchpad where every innovator has the structure and the network to validate their vision and build for the real world.
            </p>
          </div>

          {/* Card 2 */}
          <div className="about-dual-card">
            <span className="about-card-badge">THE VISION</span>
            <h2 className="about-card-title">Redefining Impact.</h2>
            <p className="about-card-desc">
              We envision a future where the next breakthrough doesn't start in a boardroom, but on a SochX feed—powered by community and driven by hunger.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION: THE MECHANICS OF CHANGE */}
      <section className="about-mechanics-section">
        <div className="about-section-header">
          <h2 className="about-section-title">The Mechanics of Change</h2>
          <p className="about-section-desc">
            How SochX accelerates an abstract concept into an executable, validated project.
          </p>
        </div>

        <div className="about-mechanics-grid">
          {/* 01 | ENTRY */}
          <div className="about-mechanics-card">
            <span className="about-mechanics-step">01 | ENTRY</span>
            <h3 className="about-mechanics-name">Secure the Spark</h3>
            <p className="about-mechanics-text">
              Register and claim your identity. Post your vision in a structured pitch that demands attention and ensures your vision is timestamped.
            </p>
          </div>

          {/* 02 | VALIDATION */}
          <div className="about-mechanics-card">
            <span className="about-mechanics-step">02 | VALIDATION</span>
            <h3 className="about-mechanics-name">Activate the Pulse</h3>
            <p className="about-mechanics-text">
              The community votes. Real-world validation starts here. If your idea has the heat, it climbs the trending charts for maximum exposure.
            </p>
          </div>

          {/* 03 | SYNERGY */}
          <div className="about-mechanics-card">
            <span className="about-mechanics-step">03 | SYNERGY</span>
            <h3 className="about-mechanics-name">Form the Venture</h3>
            <p className="about-mechanics-text">
              Stop working solo. Use our networking hub to find co-founders who possess the skills you lack. Build a team that can actually scale.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOUNDER'S NOTE SECTION */}
      <section className="about-founders-note-wrap">
        <div className="about-founders-note-card">
          <span className="about-founders-badge">A NOTE FROM THE FOUNDERS</span>
          <blockquote className="about-founders-quote">
            "SochX was built because I refused to let another great idea die in a notebook."
          </blockquote>
          <p className="about-founders-subtext">
            We are building a culture where innovation isn't a hobby—it's a responsibility. Join us in making an impact that lasts.
          </p>
          <div className="about-founders-signoff">
            Founders SochX | Lead Visionary, SochX
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
