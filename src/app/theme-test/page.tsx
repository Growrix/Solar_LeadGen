'use client';

import { useState } from 'react';

export default function ThemeTestPage() {
  const [isDark, setIsDark] = useState(true);

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* Header with Theme Toggle */}
        <header className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-heading-2 text-foreground">
              Theme Test Dashboard
            </h1>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-foreground-secondary transition-colors"
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Color Palette Display */}
          <section className="bg-surface border border-border rounded-xl p-6 shadow-lg">
            <h2 className="text-heading-3 text-foreground mb-6">
              🎨 Your New Dark Theme Color Palette
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Background Colors */}
              <div className="space-y-3">
                <h3 className="text-foreground">Background Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-background border border-border"></div>
                    <div>
                      <p className="text-body-small text-foreground">Primary</p>
                      <p className="text-caption text-subtle">#101010</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-background-alt border border-border"></div>
                    <div>
                      <p className="text-body-small text-foreground">Secondary</p>
                      <p className="text-caption text-subtle">#1A1A1A</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="space-y-3">
                <h3 className="text-foreground">Text Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-foreground"></div>
                    <div>
                      <p className="text-body-small text-foreground">Primary Text</p>
                      <p className="text-caption text-subtle">#F5F5F5</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-subtle"></div>
                    <div>
                      <p className="text-body-small text-foreground">Subtle Text</p>
                      <p className="text-caption text-subtle">#A0A0A0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-3">
                <h3 className="text-foreground">Accent Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-accent"></div>
                    <div>
                      <p className="text-body-small text-foreground">Accent</p>
                      <p className="text-caption text-subtle">#FF6B00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-accent-hover"></div>
                    <div>
                      <p className="text-body-small text-foreground">Accent Hover</p>
                      <p className="text-caption text-subtle">#FF8533</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-3">
                <h3 className="text-foreground">Border Color</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-border"></div>
                  <div>
                    <p className="text-body-small text-foreground">Border</p>
                    <p className="text-caption text-subtle">#2C2C2C</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards Demo (Like your screenshot) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: '💵' },
              { title: 'Subscriptions', value: '+2350', change: '+180.1% from last month', icon: '👥' },
              { title: 'Sales', value: '+12,234', change: '+19% from last month', icon: '📊' },
              { title: 'Active Now', value: '+573', change: '+201 since last hour', icon: '📈' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-body-small text-subtle">{stat.title}</p>
                  <span className="text-heading-2">{stat.icon}</span>
                </div>
                <p className="text-heading-2 text-foreground mb-2">{stat.value}</p>
                <p className="text-caption text-subtle">{stat.change}</p>
              </div>
            ))}
          </section>

          {/* Chart Demo */}
          <section className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-heading-4 text-foreground mb-6">Sales Overview</h3>
            <div className="flex items-end justify-between space-x-2 h-64">
              {[3, 4, 3.5, 5, 5.5, 6, 7, 7.5, 8, 9, 9.5, 10].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-accent hover:bg-accent-hover transition-colors rounded-t cursor-pointer"
                    style={{ height: `${height * 10}%` }}
                  ></div>
                  <p className="text-caption text-center text-subtle mt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Sales List */}
          <section className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-heading-4 text-foreground mb-6">Recent Sales</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground-secondary">
                      U
                    </div>
                    <div>
                      <p className="text-foreground">User Name</p>
                      <p className="text-body-small text-subtle">user.name@email.com</p>
                    </div>
                  </div>
                  <p className="text-foreground">+$1,999.00</p>
                </div>
              ))}
            </div>
          </section>

          {/* Button Examples */}
          <section className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-heading-4 text-foreground mb-6">Button Examples</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-accent hover:bg-accent-hover text-foreground-secondary rounded-lg transition-colors">
                Primary Action
              </button>
              <button className="px-6 py-3 bg-surface-hover border border-border text-foreground rounded-lg hover:bg-border transition-colors">
                Secondary Action
              </button>
              <button className="px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-foreground-secondary rounded-lg transition-colors">
                Outlined Button
              </button>
            </div>
          </section>

          {/* Form Example */}
          <section className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-heading-4 text-foreground mb-6">Form Example</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-body-small text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-body-small text-foreground mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Your message..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <button className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-foreground-secondary rounded-lg transition-colors">
                Send Message
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
