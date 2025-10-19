import Link from 'next/link';

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/artist',
    icon: (
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.68.333 3.982.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.837.131 5.65.072 6.867.013 8.086 0 8.553 0 12.017c0 3.470.013 3.932.072 5.15.059 1.218.261 2.031.558 2.728.306.789.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.697.297 1.510.499 2.728.558C7.929 23.987 8.396 24 12.017 24c3.624 0 4.09-.013 5.31-.072 1.217-.06 2.03-.262 2.727-.558.789-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.697.499-1.509.558-2.728.06-1.217.072-1.685.072-5.309 0-3.47-.012-3.932-.072-5.15-.059-1.218-.262-2.031-.558-2.728-.306-.789-.718-1.459-1.384-2.126C19.76.952 19.091.541 18.302.235c-.697-.297-1.509-.499-2.728-.558C14.365.013 13.898 0 12.017 0zm.265 1.44c3.499 0 3.91.013 5.29.072 1.276.059 1.967.274 2.427.456.61.237 1.045.52 1.502.976.456.456.739.892.976 1.502.182.46.397 1.15.456 2.427.059 1.38.072 1.791.072 5.29 0 3.5-.013 3.91-.072 5.29-.059 1.276-.274 1.967-.456 2.427a4.12 4.12 0 01-.976 1.502 4.12 4.12 0 01-1.502.976c-.46.182-1.15.397-2.427.456-1.38.059-1.791.072-5.29.072-3.5 0-3.91-.013-5.29-.072-1.276-.059-1.967-.274-2.427-.456a4.12 4.12 0 01-1.502-.976 4.12 4.12 0 01-.976-1.502c-.182-.46-.397-1.15-.456-2.427-.059-1.38-.072-1.791-.072-5.29 0-3.499.013-3.91.072-5.29.059-1.276.274-1.967.456-2.427.237-.61.52-1.045.976-1.502.456-.456.892-.739 1.502-.976.46-.182 1.15-.397 2.427-.456 1.38-.059 1.791-.072 5.29-.072z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M12.017 5.838a6.18 6.18 0 100 12.36 6.18 6.18 0 000-12.36zM12.017 16a4 4 0 110-8 4 4 0 010 8z"
          clipRule="evenodd"
        />
        <circle cx="18.406" cy="5.594" r="1.44" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/artist',
    icon: (
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Email',
    href: 'mailto:artist@example.com',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const footerLinks = [
  { name: 'About', href: '/about/' },
  { name: 'Work', href: '/work/' },
  { name: 'Press', href: '/press/' },
  { name: 'Contact', href: '/contact/' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-primary-200 mt-auto">
      <div className="container-custom py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand and Description */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-light text-primary-900">
              Artist Portfolio
            </h3>
            <p className="text-sm text-primary-600 leading-relaxed">
              Contemporary artwork showcasing unique perspectives through
              painting and mixed media. Explore collections that capture
              emotion, movement, and the beauty of everyday moments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-primary-900 uppercase tracking-wide">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              {footerLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-primary-600 hover:text-primary-900 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links and Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-primary-900 uppercase tracking-wide">
              Connect
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target p-2 -m-2 text-primary-600 hover:text-primary-900 active:text-primary-800 transition-colors duration-200"
                  aria-label={`Follow on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="text-sm text-primary-600">
              <p>Available for commissions</p>
              <p>and print inquiries</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-primary-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-xs sm:text-sm text-primary-500 text-center sm:text-left">
              © {currentYear} Artist Portfolio. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-primary-500">
              <Link
                href="/privacy/"
                className="touch-target py-1 hover:text-primary-700 active:text-primary-600 transition-colors duration-200 text-center"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms/"
                className="touch-target py-1 hover:text-primary-700 active:text-primary-600 transition-colors duration-200 text-center"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
