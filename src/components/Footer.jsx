import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Horizontal Line-wise Multi-Column Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Description */}
          <div className="footer-brand-col">
            <h2 className="footer-brand-title">
              Soch<span className="footer-brand-x">X</span>
            </h2>
            <p className="footer-brand-tagline">
              Where Ideas Go Live.
            </p>
            <p className="footer-brand-desc">
              University Project — Youth Innovation Platform. Empowering students to build, share, and launch ideas with confidence.
            </p>
          </div>

          {/* Column 2: Navigation (Exact match to image) */}
          <div className="footer-nav-col">
            <h3 className="footer-col-title">Navigation</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/" className="footer-link">Home</Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">About</Link>
              </li>
              <li>
                <Link to="/ideas" className="footer-link">Ideas</Link>
              </li>
              <li>
                <Link to="/submit-idea" className="footer-link">Submit Ideas</Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">Profile</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Access (Exact match to image) */}
          <div className="footer-nav-col">
            <h3 className="footer-col-title">Access</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/login" className="footer-link">Login</Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">Registration</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (Exact match to image) */}
          <div className="footer-nav-col">
            <h3 className="footer-col-title">Support</h3>
            <ul className="footer-links-list">
              <li>
                <a href="#help" onClick={(e) => e.preventDefault()} className="footer-link">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => e.preventDefault()} className="footer-link">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#report" onClick={(e) => e.preventDefault()} className="footer-link">
                  Report Issue
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Details */}
          <div className="footer-contact-col">
            <h3 className="footer-col-title">Contact</h3>

            {/* Primary Address */}
            <div className="footer-address-block">
              <div className="footer-contact-subtitle-row">
                <MapPin className="footer-contact-icon" size={15} />
                <span className="footer-contact-subtitle">Campus Address</span>
              </div>
              <p className="footer-contact-address">
                Department of Computer Science<br />
                Lahore Leads University, Lahore
              </p>
            </div>

            {/* Inner Divider */}
            <div className="footer-contact-inner-divider" />

            {/* Secondary Address / Wing */}
            <div className="footer-address-block">
              <span className="footer-contact-subtitle">Innovation Hub</span>
              <p className="footer-contact-address">
                Leads Incubation & Research Wing<br />
                Kamahan Road, Lahore
              </p>
            </div>

            {/* Phone */}
            <div className="footer-contact-direct-row">
              <Phone className="footer-contact-icon" size={14} />
              <a href="tel:+923001234567" className="footer-contact-link">
                +92 (300) 123-4567
              </a>
            </div>

            {/* Email */}
            <div className="footer-contact-direct-row">
              <Mail className="footer-contact-icon" size={14} />
              <a href="mailto:sochx.support@gmail.com" className="footer-contact-link">
                sochx.support@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <hr className="footer-divider" />

        {/* Bottom Full-width Copyright Bar */}
        <p className="footer-copyright">
          © 2026 SochX | Department of Computer Science, Lahore Leads University. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
