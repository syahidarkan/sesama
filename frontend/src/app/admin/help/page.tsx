'use client';

import { useState } from 'react';
import { Search, Book, Video, MessageCircle, Mail, Phone, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'How do I create a new donation program?',
      answer: 'Navigate to Programs > Create New Program. Fill in all required information including title, description, target amount, and upload necessary documents. The program will be submitted for approval.',
    },
    {
      category: 'Getting Started',
      question: 'What are the different user roles?',
      answer: 'There are several roles: SUPER_ADMIN (full access), MANAGER (approvals and oversight), CONTENT_MANAGER (create programs), PENGUSUL (submit programs for approval), and DONOR (make donations).',
    },
    {
      category: 'Programs',
      question: 'How do I approve a pending program?',
      answer: 'Go to Approvals section, review the program details, verify all documents, and click Approve or Reject with comments.',
    },
    {
      category: 'Programs',
      question: 'Can I edit a program after it\'s published?',
      answer: 'Yes, go to Programs, find the program, and click Edit. Changes will be saved immediately for ADMIN users.',
    },
    {
      category: 'Donations',
      question: 'How do I track donations?',
      answer: 'Visit the Donations page to see all transactions, filter by status, program, or date range. You can also export reports.',
    },
    {
      category: 'Reports',
      question: 'How do I create a distribution report?',
      answer: 'Go to Articles > Create Report, fill in the distribution details, upload supporting documents, and submit for approval.',
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto animate-fadeIn">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">How can we help you?</h1>
        <p className="text-gray-600">
          Search our knowledge base or browse categories below
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto animate-fadeIn ">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all hover:border-gray-400"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <a
          href="https://docs.example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start space-x-3 p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-all hover-lift group animate-fadeIn "
        >
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-all group-">
            <Book className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Documentation</h3>
            <p className="text-sm text-gray-600">Read our full guides</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto transition-transform group-hover:translate-x-1" />
        </a>

        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start space-x-3 p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-all hover-lift group animate-fadeIn "
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-all group-">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Watch step-by-step guides</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto transition-transform group-hover:translate-x-1" />
        </a>

        <button className="flex items-start space-x-3 p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-all hover-lift group text-left animate-fadeIn ">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-all group-">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600">Chat with support team</p>
          </div>
        </button>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto animate-fadeIn ">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>

        {categories.map((category, catIndex) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              {category}
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {filteredFAQs
                .filter((faq) => faq.category === category)
                .map((faq, index) => {
                  const globalIndex = faqs.findIndex((f) => f === faq);
                  const isExpanded = expandedFAQ === globalIndex;
                  return (
                    <div key={index} className="group">
                      <button
                        onClick={() =>
                          setExpandedFAQ(isExpanded ? null : globalIndex)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-all group-hover:pl-5"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary-600 shrink-0 transition-transform" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 transition-all group-hover:text-primary-600 group-hover:translate-x-1" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 animate-fadeIn">
                          <p className="text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="max-w-4xl mx-auto bg-primary-50 rounded-lg border border-primary-200 p-6 animate-fadeIn ">
        <h3 className="font-semibold text-gray-900 mb-4">Still need help?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="mailto:support@sobatbantu.com"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-all hover-lift group"
          >
            <Mail className="w-5 h-5 text-primary-600 transition-transform group-" />
            <div>
              <div className="font-medium text-gray-900">Email Support</div>
              <div className="text-sm text-gray-600">support@sobatbantu.com</div>
            </div>
          </a>

          <a
            href="tel:+628123456789"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-all hover-lift group"
          >
            <Phone className="w-5 h-5 text-primary-600 transition-transform group-" />
            <div>
              <div className="font-medium text-gray-900">Phone Support</div>
              <div className="text-sm text-gray-600">+62 812-3456-7890</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
