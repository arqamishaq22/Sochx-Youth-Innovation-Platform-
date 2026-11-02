import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Zap, Rocket, Lightbulb, Users, ArrowRight } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmitIdeasClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('You must be logged in to submit an idea.');
      navigate('/login', { state: { from: { pathname: '/submit-idea' } } });
    } else {
      navigate('/submit-idea');
    }
  };

  const founders = [
    {
      id: 'founder-1',
      name: 'Arqam Ishaq',
      role: 'CO-FOUNDER & FULL STACK ARCHITECT',
      desc: 'Focused on complete frontend-backend architecture and robust system performance.',
      initials: 'AI',
      image: '/M2.jpeg',
    },
    {
      id: 'founder-2',
      name: 'Faryal Azhar',
      role: 'CO-FOUNDER & LEAD FRONTEND ARCHITECT',
      desc: 'Leading modern UI/UX design, core frontend development, and youth innovation vision',
      initials: 'FA',
      image: '/M1.png',
    },
  ];

  return (
    <div className="home-container">

      {/* 1. HERO BANNER */}
      <section className="home-hero-banner">
        <div className="home-hero-content">
          <div className="home-hero-text-wrap">
            <div className="home-hero-tag">
              <Lightbulb size={16} />
              <span>University Project — Youth Innovation Platform</span>
            </div>

            <h1 className="home-hero-headline">
              Own the <span className="home-hero-future-text">Future.</span>
            </h1>

            <p className="home-hero-paragraph">
              SochX is the ultimate ecosystem where the world's brightest minds meet the resources to build the impossible. From vision to venture, we accelerate your impact.
            </p>

            <div className="home-hero-actions">
              <Link to="/ideas" className="home-btn-primary">
                Explore Ideas
                <ArrowRight size={16} />
              </Link>
              <button onClick={handleSubmitIdeasClick} className="home-btn-secondary">
                Submit Ideas
              </button>
            </div>
          </div>

          {/* Right Side: SochX Innovation Mascot placeholder box/graphic */}
          <div className="home-hero-mascot-box">
            <img
              src="/logo.svg"
              alt="SochX Innovation Mascot"
              className="home-mascot-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="home-mascot-caption">
              SochX Innovation Mascot
            </span>
          </div>
        </div>
      </section>

      {/* 2. METRICS BAR */}
      <section className="home-metrics-bar">
        <div className="home-metrics-grid">
          <div className="home-metric-card">
            <p className="home-metric-number">1.2K+</p>
            <p className="home-metric-label">Ideas Submitted</p>
          </div>
          <div className="home-metric-card">
            <p className="home-metric-number">450+</p>
            <p className="home-metric-label">Partnerships Formed</p>
          </div>
          <div className="home-metric-card">
            <p className="home-metric-number">98%</p>
            <p className="home-metric-label">Founder Satisfaction</p>
          </div>
        </div>
      </section>

      {/* 3. SECTION: THE BLUEPRINT OF SUCCESS */}
      <section className="home-section-blueprint">
        <div className="home-section-title-wrap">
          <h2 className="home-purple-title">The Blueprint of Success</h2>
          <p className="home-section-subtitle">
            A three-stage framework designed to transform raw youth creativity into scalable venture reality.
          </p>
        </div>

        <div className="home-process-grid">
          {/* Card 01 */}
          <div className="home-process-card">
            <span className="home-card-step-badge">Card 01 | The Spark</span>
            <h3 className="home-card-heading">Post Your Vision</h3>
            <p className="home-card-desc">
              Post your vision. Use our structured interface to turn a raw thought into a professional-grade project proposal.
            </p>
          </div>

          {/* Card 02 */}
          <div className="home-process-card">
            <span className="home-card-step-badge">Card 02 | The Synergy</span>
            <h3 className="home-card-heading">Connect & Build</h3>
            <p className="home-card-desc">
              Don't build in isolation. Our network connects you with co-founders who possess the hunger and the skills to scale your idea.
            </p>
          </div>

          {/* Card 03 */}
          <div className="home-process-card">
            <span className="home-card-step-badge">Card 03 | The Launch</span>
            <h3 className="home-card-heading">Scale & Validate</h3>
            <p className="home-card-desc">
              Gain community validation, climb the trending charts, and catch the eye of top-tier mentors and potential backers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION: BUILT BY INNOVATORS, FOR INNOVATORS */}
      <section className="home-section-innovators">
        <div className="home-innovators-grid">
          {/* Left Points */}
          <div>
            <h2 className="home-innovators-title">
              Built by Innovators, For Innovators.
            </h2>
            <div className="home-innovators-list">
              <div className="home-point-item">
                <div className="home-point-icon">
                  <ShieldCheck size={20} />
                </div>
                <p className="home-point-text">
                  <strong>Intellectual Security:</strong>
                  Every post is timestamped and verified.
                </p>
              </div>

              <div className="home-point-item">
                <div className="home-point-icon">
                  <Zap size={20} />
                </div>
                <p className="home-point-text">
                  <strong>Zero Friction:</strong>
                  Go from idea to team-building in minutes.
                </p>
              </div>

              <div className="home-point-item">
                <div className="home-point-icon">
                  <Rocket size={20} />
                </div>
                <p className="home-point-text">
                  <strong>Venture-Ready:</strong>
                  We bridge the gap between 'student project' and 'real-world startup'.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: SochX Network graphic block */}
          <div className="home-network-block">
            <div className="home-network-nodes">
              <div className="home-node">DEV</div>
              <div className="home-node">AI</div>
              <div className="home-node">DES</div>
              <div className="home-node">BIZ</div>
            </div>
            <h3 className="home-network-title">SochX Network</h3>
            <p className="home-network-desc">
              Connecting university developers, designers, and innovators into unified project squads ready for national innovation challenges.
            </p>
          </div>
        </div>
      </section>

      {/* 5. MISSION BANNER: BEYOND THE PLATFORM */}
      <section className="home-mission-banner-wrap">
        <div className="home-mission-banner">
          <h2 className="home-mission-title">Beyond the Platform.</h2>
          <p className="home-mission-text">
            We're building a world where no great idea ever dies in a notebook. Want to see the mission driving the movement?
          </p>
          <Link to="/about" className="home-mission-btn">
            DISCOVER OUR STORY
          </Link>
        </div>
      </section>

      {/* 6. SECTION: MEET THE TEAM */}
      <section className="home-section-team">
        <div className="home-section-title-wrap">
          <h2 className="home-purple-title">Meet the Team</h2>
          <p className="home-section-subtitle">
            The minds behind SochX — building a platform where ideas come to life.
          </p>
        </div>

        <div className="home-team-grid">
          {founders.map((founder) => (
            <div key={founder.id} className="home-team-card">
              <div className="home-avatar-circle-ring">
                {founder.image ? (
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="home-avatar-img"
                  />
                ) : (
                  <div className="home-avatar-inner">{founder.initials}</div>
                )}
              </div>

              <h3 className="home-team-name">{founder.name}</h3>
              <p className="home-team-role">{founder.role}</p>
              <p className="home-team-desc">{founder.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
