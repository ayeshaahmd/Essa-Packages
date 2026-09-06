import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './styles.css';
import './photo-effects.css';
import './logo.css';
import './responsive-ui.css';
import './premium-experience.css';
import './configurator.css';
import './admin.css';
import './design-refresh.css';
import './manufacturing-site.css';

import { OrderProvider } from './context/OrderContext';
import { CartDrawer } from './components/CartDrawer';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { ToastContainer } from './components/ToastContainer';
import { AdminPanel as PremiumAdminPanel } from './admin/AdminPanel';
import { ManufacturingSite } from './ManufacturingSite';

const products = [
  {
    id: 'fancy-carton',
    category: 'Premium Packaging',
    title: 'Fancy Cartons',
    detail: 'Premium printed cartons designed to give your products a professional and attractive appearance.',
    tags: ['Retail', 'Product Packaging'],
    tone: 'ivory',
    shape: 'tall',
    image: '/images/fancy-carton-photo.png',
    imageAlt: 'Printed fancy carton packaging'
  },
  {
    id: 'master-box',
    category: 'Storage & Transport',
    title: 'Master Boxes',
    detail: 'Strong and durable boxes designed for storage, transportation, and bulk packaging.',
    tags: ['Bulk Packaging', 'Transport'],
    tone: 'charcoal',
    shape: 'cube',
    image: '/images/master-boxes-photo.png',
    imageAlt: 'Strong master carton packaging'
  },
  {
    id: 'corrugated-mailer',
    category: 'Shipping & Distribution',
    title: 'Corrugated Cartons',
    detail: 'Reliable and protective packaging solutions for shipping, distribution, and heavy-duty applications.',
    tags: ['Shipping', 'Heavy-Duty'],
    tone: 'kraft',
    shape: 'wide',
    image: '/images/origin-supply-photo.png',
    imageAlt: 'Corrugated mailer cartons'
  },
  {
    id: 'rigid-gift-box',
    category: 'Made for Your Needs',
    title: 'Custom Packaging',
    detail: 'Packaging manufactured according to your required size, design, material, and specifications.',
    tags: ['Custom Sizes', 'Custom Design'],
    tone: 'charcoal',
    shape: 'wide',
    image: '/images/custom-rigid-gift-box-photo.png',
    imageAlt: 'Custom rigid gift box packaging'
  },
  {
    id: 'printed-carton',
    category: 'Brand Identity',
    title: 'Printed Cartons',
    detail: 'High-quality printing that helps your packaging communicate your brand and product identity.',
    tags: ['Printing', 'Branding'],
    tone: 'copper',
    shape: 'slim',
    image: '/images/printed-cartons-photo.png',
    imageAlt: 'Printed product carton packaging'
  },
  {
    id: 'presentation-box',
    category: 'Flexible Solutions',
    title: 'All Types of Cartons',
    detail: 'Customized packaging solutions for different products, industries, and business requirements.',
    tags: ['Custom Boxes', 'Business Packaging'],
    tone: 'lilac',
    shape: 'tall',
    image: '/images/bloom-studio-photo.png',
    imageAlt: 'Custom presentation carton packaging'
  }
];

const faqItems = [
  ['What types of cartons do you manufacture?', 'We manufacture fancy cartons, master boxes, corrugated cartons, printed cartons, custom boxes, and various other packaging solutions.'],
  ['Do you accept custom orders?', 'Yes. We manufacture cartons according to your required size, design, material, printing, and quantity.'],
  ['Do you take orders from different cities?', 'Yes. We accept orders from customers and businesses across Pakistan.'],
  ['Can I order packaging for my business?', 'Absolutely. We provide packaging solutions for businesses across different industries and product categories.'],
  ['Can I request a quotation before placing an order?', 'Yes. Contact our team with your packaging requirements and we will discuss your order and provide a quotation.']
];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className={diagonal ? 'arrow diagonal' : 'arrow'}>↗</span>;
}

function Mark() {
  return <span className="mark" aria-hidden="true"><i></i><i></i><i></i></span>;
}

function SectionTag({ children, light = false }) {
  return <p className={light ? 'section-tag light' : 'section-tag'}><span></span>{children}</p>;
}

function TiltPhoto({ src, alt, className = '' }) {
  const [style, setStyle] = useState({});
  const tilt = event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 760) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setStyle({ '--rx': `${-y * 5}deg`, '--ry': `${x * 6}deg`, '--px': `${x * 9}px`, '--py': `${y * 9}px` });
  };
  return (
    <div className={`tilt-photo ${className}`} style={style} onMouseMove={tilt} onMouseLeave={() => setStyle({})}>
      <img src={src} alt={alt} />
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

function Header({ onQuote }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    ['Home', '#home'],
    ['About', '#about'],
    ['Solutions', '#solutions'],
    ['Quality', '#quality'],
    ['Process', '#process'],
    ['Products', '#products'],
    ['FAQ', '#faq']
  ];

  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand logo-brand" href="#home" aria-label="Essa Packages home" onClick={close}>
        <img src="/images/essa-packages-logo.png" alt="Essa Packages" />
      </a>

      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href.startsWith('.') ? undefined : href}
            onClick={(e) => {
              close();
              if (href.startsWith('.')) {
                e.preventDefault();
                const el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {label}
          </a>
        ))}
        <a className="mobile-cart-btn" href="https://wa.me/923452801957" target="_blank" rel="noreferrer" onClick={close}>
          WhatsApp Imran
        </a>
        <a className="mobile-contact" href="https://wa.me/923452801957" target="_blank" rel="noreferrer" onClick={close}>
          WhatsApp Imran (0345 2801957)
        </a>
        <button className="nav-quote mobile-quote" onClick={() => { close(); onQuote(); }}>
          Request a Quote <Arrow />
        </button>
      </nav>

      <div className="header-right">
        <a
          className="header-cart-btn"
          href="https://wa.me/923452801957"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Imran on WhatsApp"
        >
          <span>💬</span>
          <span className="cart-text">WhatsApp</span>
        </a>

        <a className="contact-link" href="tel:+923452801957">
          Call Imran <Arrow />
        </a>

        <button className="nav-quote" onClick={onQuote}>
          Request a Quote <Arrow />
        </button>
      </div>

      <button
        className={open ? 'menu-button active' : 'menu-button'}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        <span></span><span></span>
      </button>
    </header>
  );
}

function Hero({ onQuote }) {
  return (
    <section id="home" className="hero">
      <div className="grid-backdrop"></div>
      <div className="hero-copy">
        <SectionTag light>Essa Packages</SectionTag>
        <h1>Packaging That Makes Your<br /><em>Brand Stand Out.</em></h1>
        <p><strong>High-quality packaging solutions designed, manufactured, and delivered with precision.</strong> At Essa Packages, we specialize in manufacturing premium cartons and packaging solutions for businesses across Pakistan. From fancy cartons to master boxes and corrugated cartons, we deliver packaging that protects your products and strengthens your brand.</p>

        {/* Heritage & Manufacturing Stats */}
        <div className="hero-stats-row">
          <div className="hero-stat-box">
            <b>Quality</b>
            <small>Packaging Solutions</small>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-box">
            <b>Precision</b>
            <small>Designed & Made</small>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-box">
            <b>Pakistan</b>
            <small>Serving Customers</small>
          </div>
        </div>

        <div className="hero-actions">
          <button onClick={onQuote} className="button button-copper">
            Request a Quote <Arrow />
          </button>
          <a className="text-link" href="#solutions">
            Explore Solutions <Arrow />
          </a>
        </div>

        <div className="hero-direct-line">
          <a href="https://wa.me/923452801957" target="_blank" rel="noreferrer">
            <span></span>Talk directly with Imran Ahmed (0345 2801957)
          </a>
          <b>Serving Customers Across Pakistan</b>
        </div>
      </div>

      <div className="hero-visual" aria-label="Photographs of custom premium cartons">
        <div className="hero-orbit orbit-one"></div>
        <div className="hero-orbit orbit-two"></div>
        <div className="hero-photo-stack">
          <TiltPhoto className="hero-photo hero-photo-main" src="/images/custom-rigid-gift-box-photo.png" alt="Photograph of a matte-black rigid gift box" />
          <TiltPhoto className="hero-photo hero-photo-left" src="/images/fancy-carton-photo.png" alt="Photograph of a luxury folding carton" />
          <TiltPhoto className="hero-photo hero-photo-right" src="/images/origin-supply-photo.png" alt="Photograph of white and kraft mailer cartons" />
        </div>
        <div className="hero-card hero-card-top">
          <span>01</span>
          <b>Made for<br />your product</b>
        </div>
        <div className="hero-card hero-card-bottom">
          <span className="pulse"></span>
          <b>Quality in every<br />carton</b>
        </div>
      </div>

      <div className="hero-bottom">
        <p>Quality packaging that protects your products<br />and strengthens your brand.</p>
        <a href="#solutions" aria-label="Explore our products" className="scroll-cue">
          <span>EXPLORE OUR PRODUCTS</span><i>↓</i>
        </a>
      </div>
    </section>
  );
}

function CapabilityStrip() {
  const capabilities = [
    ['High-Quality Materials', 'Selected for strength, finish, and reliable performance.'],
    ['Experienced Manufacturing Team', 'Skilled support from requirements through production.'],
    ['Strong & Durable Packaging', 'Made to protect products in storage and transportation.'],
    ['Professional Finishing', 'A clean, confident presentation for your products.'],
    ['Consistent Quality', 'Careful checks that keep every order dependable.']
  ];

  return (
    <section className="capability-strip" aria-label="Our quality promise">
      {capabilities.map(([title, description], i) => (
        <div key={title}>
          <span>0{i + 1}</span>
          <b>{title}</b>
          <small>{description}</small>
        </div>
      ))}
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about section-shell">
      <div className="about-heading">
        <SectionTag>About Essa Packages</SectionTag>
        <h2>We Build Packaging That<br /><em>Works for Your Business.</em></h2>
      </div>
      <div className="about-copy">
        <p>With years of experience in the packaging industry, Essa Packages combines skilled craftsmanship, quality materials, and reliable production to deliver packaging solutions that meet your business needs.</p>
        <p>Whether you need packaging for retail products, food, cosmetics, pharmaceuticals, garments, electronics, or other industries, we provide solutions tailored to your requirements.</p>
        <a className="underlined-link" href="#process">Quality. Experience. Reliability. <Arrow /></a>
      </div>
      <div className="about-art">
        <div className="art-panel art-panel-one photo-panel">
          <img src="/images/master-boxes-photo.png" alt="Master carton product packaging" />
          <span>QUALITY<br />MATERIALS</span>
        </div>
        <div className="art-panel art-panel-two photo-panel">
          <img src="/images/bloom-studio-photo.png" alt="Printed carton product packaging" />
          <span>MADE FOR<br />YOUR BUSINESS</span>
        </div>
        <div className="art-stat">
          <b>Packaging built<br />with purpose.</b>
          <span>Practical, attractive, and made to meet your requirements.</span>
        </div>
      </div>
    </section>
  );
}

function Solutions({ onQuote }) {
  return (
    <section id="solutions" className="solutions">
      <div className="section-shell solutions-head">
        <div>
          <SectionTag light>Our Services</SectionTag>
          <h2>Complete Packaging Solutions<br /><em>Under One Roof.</em></h2>
        </div>
        <p>From concept to finished cartons, we take care of your packaging requirements with professional manufacturing and consistent quality.</p>
      </div>

      <div className={`product-grid ${products.length === 3 ? 'three-items' : products.length === 6 ? 'six-items' : ''}`}>
        {products.map((product, index) => (
          <article className="product-card" key={product.title}>
            <div className="product-top">
              <span>0{index + 1}</span>
              <button
                aria-label={`Request a quote for ${product.title}`}
                onClick={onQuote}
                title="Request a quote"
              >
                <Arrow />
              </button>
            </div>
            <TiltPhoto
              className={`product-photo ${product.tone} ${product.shape}${product.title === 'Fancy Cartons' ? ' fancy-carton-photo' : ''}`}
              src={product.image}
              alt={product.imageAlt}
            />
            <div className="product-info">
              <p>{product.category}</p>
              <h3>{product.title}</h3>
              <span>{product.detail}</span>
              <div className="product-action-row">
                <button
                  className="quick-build-link"
                  onClick={onQuote}
                >
                  Request a Quote <Arrow />
                </button>
              </div>
              <div className="tag-row">{product.tags.map(tag => <small key={tag}>{tag}</small>)}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="solutions-footer section-shell">
        <span>Need packaging made for your exact business requirements?</span>
        <button onClick={onQuote} className="text-link white">Tell us what you need <Arrow /></button>
      </div>
    </section>
  );
}

function PackagingMatch({ onQuote }) {
  const [active, setActive] = useState(0);
  const qualityPoints = [
    { title: 'High-Quality Materials', detail: 'We select quality materials to help each carton protect your product and present your brand well.', image: '/images/fancy-carton-photo.png', imageAlt: 'Fancy carton packaging' },
    { title: 'Experienced Manufacturing Team', detail: 'Our experienced team works carefully to create practical packaging for your business needs.', image: '/images/master-boxes-photo.png', imageAlt: 'Master carton packaging' },
    { title: 'Strong & Durable Packaging', detail: 'We focus on strength and durability for packaging made for its purpose.', image: '/images/origin-supply-photo.png', imageAlt: 'Corrugated carton packaging' },
    { title: 'Professional Finishing', detail: 'Careful production and professional finishing help every carton look its best.', image: '/images/printed-cartons-photo.png', imageAlt: 'Printed carton packaging' },
    { title: 'Consistent Quality', detail: 'Every order goes through careful production checks to maintain consistency and reliability.', image: '/images/bloom-studio-photo.png', imageAlt: 'Presentation carton packaging' }
  ];
  const choice = qualityPoints[active];

  return (
    <section id="quality" className="match-section">
      <div className="section-shell match-shell">
        <div className="match-copy">
          <SectionTag light>Quality at every stage</SectionTag>
          <h2>Quality You Can Trust.<br /><em>Packaging You Can Rely On.</em></h2>
          <p>We believe good packaging starts with good quality. At Essa Packages, we focus on quality materials, precise manufacturing, strong finishing, and careful production at every stage. Our experienced team works to ensure that every carton leaving our facility meets your expectations.</p>
          <div className="match-tabs" role="tablist" aria-label="Quality standards">
            {qualityPoints.map((point, index) => (
              <button
                key={point.title}
                className={active === index ? 'active' : ''}
                onClick={() => setActive(index)}
                role="tab"
                aria-selected={active === index}
              >
                <span>0{index + 1}</span>{point.title}
              </button>
            ))}
          </div>
          <div className="match-actions-group">
            <button className="button button-copper" onClick={onQuote}>
              Discuss Your Packaging <Arrow />
            </button>
          </div>
          <div className="match-experience">
            <b>Experience That Makes a Difference.</b>
            <span>Our highly experienced team understands the importance of strength, finishing, design, size, printing, and functionality. We work closely with our customers to create packaging that is practical, attractive, and built for its purpose.</span>
          </div>
        </div>

        <div className="match-showcase">
          <div className="match-frame">
            <TiltPhoto className="match-photo" src={choice.image} alt={choice.imageAlt} />
          </div>
          <div className="match-caption">
            <span>{choice.title}</span>
            <p>{choice.detail}</p>
            <i>Essa Packages Quality</i>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process({ onQuote }) {
  const steps = [
    ['01', 'Share Your Requirements', 'Tell us about your product, required quantity, dimensions, design, and packaging needs.'],
    ['02', 'Discuss & Finalize', 'Our team works with you to finalize the appropriate packaging solution.'],
    ['03', 'Production', 'Your cartons are manufactured using quality materials and professional production processes.'],
    ['04', 'Quality Check', 'Every order goes through quality checks to maintain consistency and reliability.'],
    ['05', 'Delivery', 'Your completed order is prepared and delivered according to your requirements.']
  ];

  return (
    <section id="process" className="process section-shell">
      <div className="process-intro">
        <SectionTag>Our Process</SectionTag>
        <h2>From Your Idea to Your<br /><em>Finished Carton.</em></h2>
        <p>We make the packaging process simple.</p>
      </div>
      <div className="process-list">
        {steps.map(([num, title, text]) => (
          <article key={num}>
            <span>{num}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <Arrow />
          </article>
        ))}
      </div>
      <button className="button button-outline" onClick={onQuote}>
        Request a Quote <Arrow />
      </button>
    </section>
  );
}

function Industries() {
  const items = ['Fancy Cartons', 'Master Boxes', 'Corrugated Cartons', 'Printed Cartons', 'Custom Boxes', 'Product Packaging', 'Retail Packaging', 'Shipping & Transportation Boxes'];
  return (
    <section id="products" className="industries">
      <div className="section-shell">
        <SectionTag light>Our Products</SectionTag>
        <div className="industry-heading">
          <h2>Different Products.<br /><em>One Standard of Quality.</em></h2>
          <p>We manufacture packaging solutions for a wide range of business needs.</p>
        </div>
        <div className="industry-list">
          {items.map((item, i) => (
            <a href="#solutions" key={item}>
              <span>0{i + 1}</span>{item}<Arrow />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  const reasons = [
    ['Premium Quality', 'We focus on delivering strong, attractive, and reliable packaging.'],
    ['Experienced Team', 'Our experienced packaging professionals understand different business requirements.'],
    ['Custom Solutions', 'Every business has different needs, so we provide packaging according to your specifications.'],
    ['Reliable Production', 'We maintain consistency throughout the manufacturing process.'],
    ['Orders Across Pakistan', 'We accept packaging orders from customers and businesses across cities in Pakistan.'],
    ['Business-Focused Service', 'From small requirements to large production orders, we work to provide practical packaging solutions for your business.']
  ];

  return (
    <section className="why-choose section-shell">
      <div className="why-heading">
        <SectionTag>Why Choose Us</SectionTag>
        <h2>Why Businesses Choose<br /><em>Essa Packages.</em></h2>
      </div>
      <div className="why-grid">
        {reasons.map(([title, text], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FAQ({ onQuote }) {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="faq section-shell">
      <div>
        <SectionTag>Frequently Asked Questions</SectionTag>
        <h2>Questions,<br /><em>Neatly Packed.</em></h2>
        <p>Find answers about our cartons, custom packaging, quotations, and orders across Pakistan.</p>

        <a href="https://wa.me/923452801957" target="_blank" rel="noreferrer" className="text-link">
          WhatsApp Imran for fast answers <Arrow />
        </a>
      </div>

      <div className="accordion">
        {faqItems.map(([question, answer], i) => (
          <article key={question} className={open === i ? 'open' : ''}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{question}</span>
              <i>{open === i ? '−' : '+'}</i>
            </button>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuoteForm({ onClose }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({ name: '', company: '', email: '', phone: '', type: '', quantity: '', details: '', dimensions: '' });
  const [fileName, setFileName] = useState('');
  const [artworkFile, setArtworkFile] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNotified, setWhatsappNotified] = useState(false);

  const update = e => setData({ ...data, [e.target.name]: e.target.value });
  const updateArtworkFile = e => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 4 * 1024 * 1024) {
      setArtworkFile(null);
      setFileName('');
      setSubmitError('Please choose an artwork or reference file smaller than 4 MB.');
      e.target.value = '';
      return;
    }
    setArtworkFile(file);
    setFileName(file?.name || '');
    setSubmitError('');
  };
  const canProceed = step === 1 ? data.name && data.company && data.email : step === 2 ? data.type && data.quantity : true;

  const next = async e => {
    e.preventDefault();
    if (step < 3 && canProceed) {
      setStep(step + 1);
    } else if (step === 3) {
      setSubmitError('');
      setIsSubmitting(true);

      try {
        const payload = { action: 'submit', ...data };
        if (artworkFile) {
          payload.file = {
            name: artworkFile.name,
            type: artworkFile.type,
            data: await fileToDataUrl(artworkFile)
          };
        }

        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Quote submission failed');
        setWhatsappNotified(Boolean(result.whatsappNotified));
        setSubmitted(true);
      } catch (error) {
        setSubmitError(error.message || 'We could not save your request right now. Please try again or contact Imran on WhatsApp.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const key = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button className="modal-close" onClick={onClose} aria-label="Close quote form">×</button>
        {submitted ? (
          <div className="success-state">
            <span className="success-icon">✓</span>
            <SectionTag>Request received</SectionTag>
            <h2 id="quote-title">Thank you,<br /><em>{data.name.split(' ')[0] || 'there'}.</em></h2>
            <p>Your packaging request{fileName ? ' and artwork file' : ''} have been saved securely. Our team will review the details and contact you using the number or email you provided.{whatsappNotified ? ' Imran has also received a WhatsApp notification.' : ''}</p>
            <div className="success-buttons">
              <button className="button button-dark" onClick={onClose}>
                Back to the site <Arrow />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="quote-modal-head">
              <SectionTag>Start a project</SectionTag>
              <h2 id="quote-title">Tell us what you<br /><em>need.</em></h2>
              <p>Share your product, quantity, dimensions, design, and packaging requirements.</p>
            </div>
            <div className="form-progress">
              <span className={step >= 1 ? 'active' : ''}>01 <b>About you</b></span>
              <i></i>
              <span className={step >= 2 ? 'active' : ''}>02 <b>Your packaging</b></span>
              <i></i>
              <span className={step >= 3 ? 'active' : ''}>03 <b>The details</b></span>
            </div>
            <form onSubmit={next}>
              {step === 1 && (
                <div className="form-fields">
                  <label>Full name
                    <input required autoFocus name="name" value={data.name} onChange={update} placeholder="Your name" />
                  </label>
                  <label>Company name
                    <input required name="company" value={data.company} onChange={update} placeholder="Your company" />
                  </label>
                  <label>Email address
                    <input required type="email" name="email" value={data.email} onChange={update} placeholder="you@company.com" />
                  </label>
                  <label>Phone / WhatsApp <small>(recommended)</small>
                    <input name="phone" value={data.phone} onChange={update} placeholder="e.g. 0345 2801957" />
                  </label>
                </div>
              )}
              {step === 2 && (
                <div className="form-fields">
                  <label>What are you looking to make?
                    <select required autoFocus name="type" value={data.type} onChange={update}>
                      <option value="">Select packaging type</option>
                      {products.map(p => <option key={p.title}>{p.title}</option>)}
                      <option>Custom Boxes</option>
                      <option>Product Packaging</option>
                      <option>Retail Packaging</option>
                      <option>Shipping & Transportation Boxes</option>
                      <option>Something else</option>
                    </select>
                  </label>
                  <label>Estimated quantity
                    <input required name="quantity" value={data.quantity} onChange={update} placeholder="e.g. 1,000 units" />
                  </label>
                  <label>Product / box dimensions <small>(optional)</small>
                    <input name="dimensions" value={data.dimensions || ''} onChange={update} placeholder="L × W × H (cm or inches)" />
                  </label>
                </div>
              )}
              {step === 3 && (
                <div className="form-fields">
                  <label>Tell us more
                    <textarea autoFocus name="details" value={data.details} onChange={update} placeholder="Product type, material ideas, print requirements, finishing details, or your target timeline…"></textarea>
                  </label>
                  <label className="file-field">
                    <span>
                      Artwork or reference <small>(optional · PDF, AI, PSD, PNG, JPG)</small>
                      {fileName && <small className="file-selected" aria-live="polite">Selected: {fileName}</small>}
                    </span>
                    <input name="artwork" type="file" accept=".pdf,.ai,.psd,.png,.jpg,.jpeg" onChange={updateArtworkFile} />
                    <em>{fileName || 'Choose a file'}</em>
                  </label>
                  <p className="privacy-copy">Your selected file is saved securely with your quote request. Maximum file size: 4 MB.</p>
                </div>
              )}
              {submitError && <p className="quote-submit-error" role="alert">{submitError}</p>}
              <div className="form-actions">
                {step > 1 && (
                  <button type="button" className="back-button" onClick={() => setStep(step - 1)}>
                    ← Back
                  </button>
                )}
                <button type="submit" className="button button-copper" disabled={!canProceed || isSubmitting}>
                  {step === 3 ? (isSubmitting ? 'Sending request...' : 'Send quote request') : 'Continue'} <Arrow />
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function CTA({ onQuote }) {
  return (
    <section id="quote" className="cta">
      <div className="cta-noise"></div>
      <div>
        <SectionTag light>Ready to get started?</SectionTag>
        <h2>Give Your Product a<br /><em>Better Box.</em></h2>
        <p>Quality packaging. Professional manufacturing. Reliable service.</p>
        <p>Tell us what you need, and let Essa Packages create the right packaging solution for your business.</p>
        <div className="cta-action-row">
          <button className="button button-copper" onClick={onQuote}>
            Request a Quote <Arrow />
          </button>
          <a className="button button-outline-light" href="https://wa.me/923452801957" target="_blank" rel="noreferrer">
            Contact Us <Arrow />
          </a>
        </div>
        <small>Call or WhatsApp Imran Ahmed directly at 0345 2801957.</small>
      </div>
    </section>
  );
}

function Footer({ onQuote }) {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-main">
        <a className="brand logo-brand footer-brand" href="#home">
          <img src="/images/essa-packages-logo.png" alt="Essa Packages" />
        </a>
        <div>
          <p className="footer-title">Packaging With Purpose.<br />Made for <em>Your Brand.</em></p>
          <p className="footer-description">Professional packaging solutions for businesses across Pakistan.</p>
          <div className="footer-nav-buttons">
            <button onClick={onQuote} className="button button-small button-copper">
              Request a Quote <Arrow />
            </button>
            <a href="#solutions" className="button button-small button-outline-light">
              Our Products <Arrow />
            </a>
            <a className="text-link white" href="#about">About Us <Arrow /></a>
          </div>
        </div>

        <address className="footer-contact">
          <span>FACTORY & CONTACT DETAILS</span>
          <p>
            <b>Imran Ahmed</b><br />
            <a href="tel:+923452801957">0345 2801957</a> <em>· Primary / WhatsApp</em><br />
            <a href="tel:+923352897171">0335 2897171</a> <em>· Alternate</em><br />
            <a href="mailto:imran.essapackages@gmail.com">imran.essapackages@gmail.com</a>
          </p>
          <a
            className="address-link"
            href="https://maps.app.goo.gl/Jx7EcbCt53zRR4Vo6"
            target="_blank"
            rel="noreferrer"
          >
            Plot No. B-81, Sector 11-E,<br />
            New Fatima Jinnah Colony, Near Godra,<br />
            North Karachi, Pakistan <Arrow />
          </a>
        </address>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Essa Packages. All rights reserved.</span>
        <span>Fancy Cartons · Master Boxes · Corrugated Cartons · Custom Packaging</span>
        <span>Professional packaging for your business</span>
      </div>

      <a
        className="whatsapp"
        href="https://wa.me/923452801957"
        target="_blank"
        rel="noreferrer"
        aria-label="Start a WhatsApp conversation with Imran Ahmed"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.81 11.81 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  );
}

function MainApp() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = quoteOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [quoteOpen]);

  const openQuote = () => setQuoteOpen(true);

  return (
    <>
      <Header onQuote={openQuote} />
      <main>
        <Hero onQuote={openQuote} />
        <CapabilityStrip />
        <About />
        <Solutions onQuote={openQuote} />
        <PackagingMatch onQuote={openQuote} />
        <Process onQuote={openQuote} />
        <Industries />
        <WhyChoose />
        <FAQ onQuote={openQuote} />
        <CTA onQuote={openQuote} />
      </main>
      <Footer onQuote={openQuote} />
      {quoteOpen && <QuoteForm onClose={() => setQuoteOpen(false)} />}
      <CartDrawer />
      <OrderReceiptModal />
      <ToastContainer />
    </>
  );
}

const ADMIN_STATUSES = ['New', 'Contacted', 'Quoted', 'Completed', 'Archived'];

function AdminPanel() {
  const [password, setPassword] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const requestQuotes = async adminPassword => {
    const response = await fetch('/api/quotes', { headers: { 'x-essa-admin-password': adminPassword } });
    if (response.status === 401) throw new Error('The admin password is incorrect.');
    if (!response.ok) throw new Error('The quote dashboard is available after this site is deployed to Netlify.');
    const payload = await response.json();
    return payload.quotes || [];
  };

  const login = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const savedQuotes = await requestQuotes(password);
      setQuotes(savedQuotes);
      setAuthenticated(true);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      setQuotes(await requestQuotes(password));
    } catch (refreshError) {
      setError(refreshError.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-essa-admin-password': password },
        body: JSON.stringify({ action: 'update-status', id, status })
      });
      if (!response.ok) throw new Error('Could not update this quote.');
      const payload = await response.json();
      setQuotes(current => current.map(quote => quote.id === id ? payload.quote : quote));
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setUpdatingId('');
    }
  };

  const downloadCsv = () => {
    const fields = ['ID', 'Date', 'Status', 'Name', 'Company', 'Email', 'Phone', 'Packaging Type', 'Quantity', 'Dimensions', 'Details', 'Artwork File', 'WhatsApp Notification'];
    const escapeCsv = value => `"${String(value || '').replaceAll('"', '""')}"`;
    const rows = quotes.map(quote => [
      quote.id, quote.createdAt, quote.status, quote.name, quote.company, quote.email, quote.phone,
      quote.type, quote.quantity, quote.dimensions, quote.details, quote.file?.name || '',
      quote.whatsappNotified ? 'Sent' : 'Not configured / not sent'
    ].map(escapeCsv).join(','));
    const csv = [fields.map(escapeCsv).join(','), ...rows].join('\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = `essa-packages-quotes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(href);
  };

  const downloadArtwork = async quote => {
    setError('');
    try {
      const response = await fetch(`/api/quotes?action=file&id=${encodeURIComponent(quote.id)}`, {
        headers: { 'x-essa-admin-password': password }
      });
      if (!response.ok) throw new Error('Could not download this artwork file.');
      const href = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = href;
      link.download = quote.file.name;
      link.click();
      URL.revokeObjectURL(href);
    } catch (fileError) {
      setError(fileError.message);
    }
  };

  const counts = quotes.reduce((all, quote) => ({ ...all, [quote.status]: (all[quote.status] || 0) + 1 }), {});

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <a className="admin-brand" href="#home"><img src="/images/essa-packages-logo.png" alt="Essa Packages" /></a>
        <section className="admin-login-card">
          <SectionTag light>Secure access</SectionTag>
          <h1>Quote<br /><em>Dashboard.</em></h1>
          <p>View quote requests, download artwork, update their progress, and export your CSV.</p>
          <form onSubmit={login}>
            <label>Admin password
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoFocus required placeholder="Enter your password" />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="button button-copper" disabled={loading}>{loading ? 'Checking access...' : 'Open Dashboard'} <Arrow /></button>
          </form>
          <a href="#home" className="admin-back-link">Back to website <Arrow /></a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="#home"><img src="/images/essa-packages-logo.png" alt="Essa Packages" /></a>
        <div>
          <button className="admin-text-button" onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          <button className="admin-text-button" onClick={() => { setAuthenticated(false); setPassword(''); }}>Sign out</button>
          <a className="button button-small button-copper" href="#home">View Website <Arrow /></a>
        </div>
      </header>
      <section className="admin-content">
        <div className="admin-heading">
          <div>
            <SectionTag light>Essa Packages</SectionTag>
            <h1>Quote<br /><em>Dashboard.</em></h1>
            <p>New requests are saved here. Download a CSV whenever you need it.</p>
          </div>
          <button className="button button-copper" onClick={downloadCsv} disabled={!quotes.length}>Download CSV <Arrow /></button>
        </div>

        <div className="admin-stats" aria-label="Quote status summary">
          <article><span>All Requests</span><b>{quotes.length}</b></article>
          <article><span>New</span><b>{counts.New || 0}</b></article>
          <article><span>Quoted</span><b>{counts.Quoted || 0}</b></article>
          <article><span>Completed</span><b>{counts.Completed || 0}</b></article>
        </div>

        {error && <p className="admin-error" role="alert">{error}</p>}

        <section className="quote-table-wrap">
          {!quotes.length ? (
            <div className="admin-empty"><b>No quote requests yet.</b><span>New requests from your website will appear here.</span></div>
          ) : (
            <div className="admin-quote-list">
              {quotes.map(quote => (
                <article className="admin-quote-card" key={quote.id}>
                  <div className="admin-quote-meta">
                    <span>{quote.id}</span>
                    <time dateTime={quote.createdAt}>{new Date(quote.createdAt).toLocaleString()}</time>
                  </div>
                  <div className="admin-quote-main">
                    <div><small>Customer</small><b>{quote.name}</b><span>{quote.company}</span></div>
                    <div><small>Contact</small><a href={`mailto:${quote.email}`}>{quote.email}</a><a href={`tel:${quote.phone}`}>{quote.phone || 'No phone provided'}</a></div>
                    <div><small>Request</small><b>{quote.type}</b><span>{quote.quantity} units{quote.dimensions ? ` · ${quote.dimensions}` : ''}</span></div>
                    <div><small>Artwork</small>{quote.file ? <button className="admin-file-button" onClick={() => downloadArtwork(quote)}>Download {quote.file.name}</button> : <span>No file attached</span>}</div>
                  </div>
                  {quote.details && <p className="admin-quote-details">{quote.details}</p>}
                  <div className="admin-quote-footer">
                    <span className={quote.whatsappNotified ? 'notification-status sent' : 'notification-status'}>{quote.whatsappNotified ? 'WhatsApp notification sent' : 'WhatsApp notification pending setup'}</span>
                    <label>Status
                      <select value={quote.status} disabled={updatingId === quote.id} onChange={event => updateStatus(quote.id, event.target.value)}>
                        {ADMIN_STATUSES.map(status => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function App() {
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');

  useEffect(() => {
    const syncRoute = () => setAdminOpen(window.location.hash === '#admin');
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  if (adminOpen) return <PremiumAdminPanel />;

  return <ManufacturingSite />;
}

createRoot(document.getElementById('root')).render(<App />);
