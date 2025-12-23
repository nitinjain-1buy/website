import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';
import ElectronicComponentsPattern from '../components/ElectronicComponentsPattern';

const MarketIntelligencePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState('all');
  const [queries, setQueries] = useState([]);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchNews();
    fetchQueries();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/news?limit=50`);
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/news/queries`);
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const filteredArticles = selectedQuery === 'all' 
    ? articles 
    : articles.filter(a => a.query === selectedQuery);

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

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Search className="w-4 h-4" />
              <span className="font-medium">Filter by topic:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedQuery === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedQuery('all')}
                className={selectedQuery === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                All News
              </Button>
              {uniqueQueries.map((query) => (
                <Button
                  key={query}
                  variant={selectedQuery === query ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuery(query)}
                  className={selectedQuery === query ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {query}
                </Button>
              ))}
            </div>
            <div className="ml-auto text-sm text-slate-500">
              {filteredArticles.length} articles
            </div>
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
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No news articles available</p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {filteredArticles[0] && (
                <div className="mb-12">
                  <a 
                    href={filteredArticles[0].link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative h-64 md:h-auto bg-slate-100">
                          {filteredArticles[0].thumbnail ? (
                            <img 
                              src={filteredArticles[0].thumbnail} 
                              alt={filteredArticles[0].title}
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
                          <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                            {filteredArticles[0].title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              {filteredArticles[0].source?.icon && (
                                <img 
                                  src={filteredArticles[0].source.icon} 
                                  alt={filteredArticles[0].source.name}
                                  className="w-4 h-4 rounded"
                                />
                              )}
                              <span>{filteredArticles[0].source?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(filteredArticles[0].iso_date)}</span>
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
                {filteredArticles.slice(1).map((article) => (
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
