import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Archive,
  ChevronDown,
  X,
  Filter,
  Check
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const MarketIntelligencePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeTab, setActiveTab] = useState('recent');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/news?limit=2000`);
      const data = await response.json();
      
      // Filter out articles without valid links or content
      const validArticles = data.filter(
        article => article.link && article.link.trim() !== '' && 
                   article.title && article.title.trim() !== '' &&
                   article.source?.name
      );
      
      // Sort by date (most recent first)
      const sortedData = validArticles.sort((a, b) => {
        const dateA = new Date(a.iso_date || a.fetchedAt || 0);
        const dateB = new Date(b.iso_date || b.fetchedAt || 0);
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
  const eightMonthsAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 8);
    return date;
  }, []);

  // Helper to get all queries for an article (handles both old 'query' string and new 'queries' array)
  const getArticleQueries = (article) => {
    if (article.queries && Array.isArray(article.queries)) {
      return article.queries;
    }
    if (article.query) {
      return [article.query];
    }
    return ['unknown'];
  };

  // Get unique topics with counts (an article with multiple queries counts once per topic)
  const topicsWithCounts = useMemo(() => {
    const counts = {};
    articles.forEach(a => {
      const queries = getArticleQueries(a);
      queries.forEach(topic => {
        counts[topic] = (counts[topic] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [articles]);

  // Filter articles by selected topics
  // Each article appears only ONCE even if it matches multiple selected topics
  const topicFilteredArticles = useMemo(() => {
    if (selectedTopics.length === 0) return articles;
    return articles.filter(a => {
      const queries = getArticleQueries(a);
      // Check if any of the article's queries match any selected topic
      return queries.some(q => selectedTopics.includes(q));
    });
  }, [articles, selectedTopics]);

  // Separate recent and archived articles
  const { recentArticles, archivedArticles } = useMemo(() => {
    const recent = [];
    const archived = [];
    
    topicFilteredArticles.forEach(article => {
      const articleDate = new Date(article.iso_date || article.fetchedAt || 0);
      if (articleDate >= eightMonthsAgo) {
        recent.push(article);
      } else {
        archived.push(article);
      }
    });
    
    return { recentArticles: recent, archivedArticles: archived };
  }, [topicFilteredArticles, eightMonthsAgo]);

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
    setVisibleCount(10);
  };

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
    setVisibleCount(10);
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
    setVisibleCount(10);
  };

  const handleSelectAll = () => {
    setSelectedTopics(topicsWithCounts.map(t => t.topic));
    setVisibleCount(10);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        <ElectronicComponentsPattern opacity={0.03} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-emerald-400 border-emerald-400/50 bg-emerald-400/10 animate-badge-pulse inline-flex items-center gap-2">
              <TrendingUp className="w-3 h-3 animate-pulse" />
              Market Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Latest News & Insights
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Real-time market intelligence from the electronics and semiconductor industry
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Filter Label + Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-700">Filter by Topic</span>
              {selectedTopics.length > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  {selectedTopics.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('recent')}
                className={activeTab === 'recent' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent ({recentArticles.length})
              </Button>
              <Button
                variant={activeTab === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('archived')}
                className={activeTab === 'archived' ? 'bg-slate-700 hover:bg-slate-800' : ''}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived ({archivedArticles.length})
              </Button>
            </div>
          </div>

          {/* Topic Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* All News Chip */}
            <button
              onClick={handleClearAll}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedTopics.length === 0
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              {selectedTopics.length === 0 && <Check className="w-3 h-3" />}
              <span>All News</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedTopics.length === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {articles.length}
              </span>
            </button>

            {/* Individual Topic Chips */}
            {topicsWithCounts.map(({ topic, count }) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{topic}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {selectedTopics.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-slate-600 hover:text-red-600 hover:border-red-300"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All Filters
              </Button>
            ) : (
              <span className="text-sm text-slate-500">
                Showing all {articles.length} articles • Click topics above to filter
              </span>
            )}
            {selectedTopics.length > 0 && selectedTopics.length < topicsWithCounts.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-slate-500"
              >
                Select All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
              <span className="text-slate-600">Loading latest news...</span>
            </div>
          ) : displayArticles.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              {activeTab === 'archived' ? (
                <>
                  <Archive className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Archived Articles</h3>
                  <p className="text-slate-500">No articles older than 8 months found for the selected topics</p>
                </>
              ) : (
                <>
                  <Newspaper className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Recent Articles</h3>
                  <p className="text-slate-500">No recent articles found for the selected topics</p>
                </>
              )}
              {selectedTopics.length > 0 && (
                <Button onClick={handleClearAll} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeTab === 'recent' ? 'Recent News' : 'Archived News'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {activeTab === 'recent' 
                      ? 'Latest articles from the past 8 months, sorted by date'
                      : 'Articles older than 8 months'
                    }
                  </p>
                </div>
                <Badge variant="outline" className="text-slate-600">
                  {displayArticles.length} articles
                </Badge>
              </div>

              {/* Featured Article (only for recent, first load, no topic filter) */}
              {activeTab === 'recent' && visibleArticles[0] && selectedTopics.length === 0 && (
                <a 
                  href={visibleArticles[0].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group mb-8"
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-80 bg-slate-700">
                        {visibleArticles[0].thumbnail ? (
                          <img 
                            src={visibleArticles[0].thumbnail} 
                            alt={visibleArticles[0].title}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600">
                            <Newspaper className="w-20 h-20 text-white/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-emerald-500 text-white border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center bg-white">
                        <Badge variant="outline" className="w-fit mb-3 text-emerald-600 border-emerald-200">
                          {getArticleQueries(visibleArticles[0])[0]}
                        </Badge>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-3">
                          {visibleArticles[0].title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-2">
                            {visibleArticles[0].source?.icon && (
                              <img 
                                src={visibleArticles[0].source.icon} 
                                alt={visibleArticles[0].source.name}
                                className="w-5 h-5 rounded"
                              />
                            )}
                            <span className="font-medium">{visibleArticles[0].source?.name}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(visibleArticles[0].iso_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                          Read full article
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </a>
              )}

              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleArticles.slice(activeTab === 'recent' && selectedTopics.length === 0 ? 1 : 0).map((article, index) => (
                  <a 
                    key={article.id || article.link || index}
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-300 bg-white">
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        {article.thumbnail ? (
                          <img 
                            src={article.thumbnail} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                            <Newspaper className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/95 text-slate-700 text-xs font-medium shadow-sm">
                            {getArticleQueries(article)[0]}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
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
                            <span className="truncate max-w-[100px]">{article.source?.name}</span>
                          </div>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(article.iso_date)}
                          </span>
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
                    className="px-10 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <ChevronDown className="w-5 h-5 mr-2" />
                    Load More Articles
                    <span className="ml-2 text-slate-400">({displayArticles.length - visibleCount} remaining)</span>
                  </Button>
                </div>
              )}

              {/* End indicator */}
              {!hasMore && visibleArticles.length > 0 && (
                <div className="mt-10 text-center">
                  <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-12 h-px bg-slate-200"></div>
                    <span>Showing all {displayArticles.length} articles</span>
                    <div className="w-12 h-px bg-slate-200"></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-4">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Powered by AI Intelligence</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our market intelligence is automatically curated from trusted industry sources, 
              updated twice daily at 8:00 AM and 4:00 PM to keep you informed about the latest developments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketIntelligencePage;
