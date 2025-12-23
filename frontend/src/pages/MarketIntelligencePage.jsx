import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  RefreshCw,
  Search,
  Sparkles,
  Archive,
  ChevronDown
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const MarketIntelligencePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeTab, setActiveTab] = useState('recent');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/news?limit=200`);
      const data = await response.json();
      
      // Sort by date (most recent first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.iso_date || a.fetchedAt);
        const dateB = new Date(b.iso_date || b.fetchedAt);
        return dateB - dateA;
      });
      
      setArticles(sortedData);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate 8 months ago
  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

  // Filter articles by query
  const queryFilteredArticles = selectedQuery === 'all' 
    ? articles 
    : articles.filter(a => a.query === selectedQuery);

  // Separate recent and archived articles
  const recentArticles = queryFilteredArticles.filter(a => {
    const articleDate = new Date(a.iso_date || a.fetchedAt);
    return articleDate >= eightMonthsAgo;
  });

  const archivedArticles = queryFilteredArticles.filter(a => {
    const articleDate = new Date(a.iso_date || a.fetchedAt);
    return articleDate < eightMonthsAgo;
  });

  // Get articles to display based on active tab
  const displayArticles = activeTab === 'recent' ? recentArticles : archivedArticles;
  const visibleArticles = displayArticles.slice(0, visibleCount);
  const hasMore = visibleCount < displayArticles.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleCount(10); // Reset visible count when switching tabs
  };

  // Get unique queries from articles
  const uniqueQueries = [...new Set(articles.map(a => a.query))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        <ElectronicComponentsPattern opacity={0.03} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-emerald-400 border-emerald-400/50 bg-emerald-400/10 animate-badge-pulse inline-flex items-center gap-2">
              <TrendingUp className="w-3 h-3 animate-pulse" />
              Market Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Latest News & Insights
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Stay ahead with real-time news and market intelligence from the electronics and semiconductor industry
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Tabs Section */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Recent/Archived Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Search className="w-4 h-4" />
              <span className="font-medium">Filter by topic:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('recent')}
                className={activeTab === 'recent' ? 'bg-slate-800 hover:bg-slate-900' : ''}
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent ({recentArticles.length})
              </Button>
              <Button
                variant={activeTab === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('archived')}
                className={activeTab === 'archived' ? 'bg-slate-800 hover:bg-slate-900' : ''}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived ({archivedArticles.length})
              </Button>
            </div>
          </div>

          {/* Query Filters - Scrollable */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedQuery === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedQuery('all'); setVisibleCount(10); }}
              className={selectedQuery === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              All News ({articles.length})
            </Button>
            {uniqueQueries.sort().map((query) => {
              const count = articles.filter(a => a.query === query).length;
              return (
                <Button
                  key={query}
                  variant={selectedQuery === query ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedQuery(query); setVisibleCount(10); }}
                  className={selectedQuery === query ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {query} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="ml-3 text-slate-600">Loading news...</span>
            </div>
          ) : displayArticles.length === 0 ? (
            <div className="text-center py-20">
              {activeTab === 'archived' ? (
                <>
                  <Archive className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No archived articles (older than 8 months)</p>
                </>
              ) : (
                <>
                  <Newspaper className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No recent news articles available</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Section Title */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  {activeTab === 'recent' ? (
                    <>
                      <Clock className="w-6 h-6 text-emerald-600" />
                      Recent News
                    </>
                  ) : (
                    <>
                      <Archive className="w-6 h-6 text-slate-500" />
                      Archived News
                    </>
                  )}
                </h2>
                <p className="text-slate-500 mt-1">
                  {activeTab === 'recent' 
                    ? 'Latest articles from the past 8 months'
                    : 'Articles older than 8 months'
                  }
                </p>
              </div>

              {/* Featured Article (only for recent tab and first load) */}
              {activeTab === 'recent' && visibleArticles[0] && (
                <div className="mb-10">
                  <a 
                    href={visibleArticles[0].link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative h-64 md:h-80 bg-slate-100">
                          {visibleArticles[0].thumbnail ? (
                            <img 
                              src={visibleArticles[0].thumbnail} 
                              alt={visibleArticles[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-600">
                              <Newspaper className="w-20 h-20 text-white/30" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-8 flex flex-col justify-center">
                          <Badge className="w-fit mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Featured
                          </Badge>
                          <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-3">
                            {visibleArticles[0].title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              {visibleArticles[0].source?.icon && (
                                <img 
                                  src={visibleArticles[0].source.icon} 
                                  alt={visibleArticles[0].source.name}
                                  className="w-4 h-4 rounded"
                                />
                              )}
                              <span>{visibleArticles[0].source?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(visibleArticles[0].iso_date)}</span>
                            </div>
                          </div>
                          <div className="mt-6 flex items-center text-emerald-600 font-medium">
                            Read full article
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </a>
                </div>
              )}

              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleArticles.slice(activeTab === 'recent' ? 1 : 0).map((article) => (
                  <a 
                    key={article.id || article.link}
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-emerald-200">
                      <div className="relative h-48 bg-slate-100">
                        {article.thumbnail ? (
                          <img 
                            src={article.thumbnail} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                            <Newspaper className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs">
                            {article.query}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            {article.source?.icon && (
                              <img 
                                src={article.source.icon} 
                                alt={article.source.name}
                                className="w-4 h-4 rounded"
                              />
                            )}
                            <span className="truncate max-w-[120px]">{article.source?.name}</span>
                          </div>
                          <span>{formatDate(article.iso_date)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleLoadMore}
                    className="px-8"
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load More ({displayArticles.length - visibleCount} remaining)
                  </Button>
                </div>
              )}

              {/* End of articles indicator */}
              {!hasMore && visibleArticles.length > 0 && (
                <div className="mt-10 text-center">
                  <p className="text-slate-400 text-sm">
                    — Showing all {displayArticles.length} {activeTab === 'archived' ? 'archived' : 'recent'} articles —
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Powered by AI</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our market intelligence is automatically curated from trusted industry sources, 
              updated multiple times daily to keep you informed about the latest developments 
              in electronics procurement and supply chain.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketIntelligencePage;
