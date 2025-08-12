// Enhanced API service for integrating with external APIs
interface WikipediaSearchResult {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}

interface GoogleBooksResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
    publishedDate?: string;
    categories?: string[];
  };
}

interface TMDbMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDbSearchResponse {
  results: TMDbMovieResult[];
  total_results: number;
  total_pages: number;
}

interface SpotifySearchResult {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
        release_date: string;
      };
      duration_ms: number;
      preview_url: string;
    }>;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  source: 'wikipedia' | 'google_books' | 'tmdb' | 'spotify';
  additionalData?: any;
}

class ApiService {
  private readonly TMDB_API_KEY = 'demo-key'; // Replace with actual API key
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private readonly TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Wikipedia API - Enhanced with better error handling
  async searchWikipedia(query: string): Promise<ContentItem | null> {
    try {
      // First, search for the page
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      
      if (!searchResponse.ok) {
        // Try alternative search if direct lookup fails
        const altSearchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json&origin=*`
        );
        
        if (!altSearchResponse.ok) {
          throw new Error('Wikipedia search failed');
        }
        
        const altData = await altSearchResponse.json();
        if (!altData[1] || altData[1].length === 0) {
          return null;
        }
        
        // Get the first result's summary
        const pageTitle = altData[1][0];
        const summaryResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
        );
        
        if (!summaryResponse.ok) {
          return null;
        }
        
        const summaryData = await summaryResponse.json();
        return this.formatWikipediaResult(summaryData);
      }
      
      const data = await searchResponse.json();
      return this.formatWikipediaResult(data);
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return null;
    }
  }

  private formatWikipediaResult(data: any): ContentItem {
    return {
      id: data.pageid?.toString() || Math.random().toString(),
      title: data.title,
      description: data.extract || 'No description available',
      image: data.thumbnail?.source || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      source: 'wikipedia',
      category: 'Articles',
      additionalData: {
        url: data.content_urls?.desktop?.page,
        lang: data.lang,
      },
    };
  }

  // Google Books API - Enhanced
  async searchBooks(query: string, maxResults: number = 10): Promise<ContentItem[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`
      );
      
      if (!response.ok) {
        throw new Error('Google Books API request failed');
      }
      
      const data = await response.json();
      
      return (data.items || []).map((item: GoogleBooksResult) => ({
        id: item.id,
        title: item.volumeInfo.title,
        description: this.truncateDescription(item.volumeInfo.description || 'No description available'),
        image: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
               'https://images.pexels.com/photos/2067569/pexels-photo-2067569.jpeg',
        source: 'google_books' as const,
        category: 'Books',
        additionalData: {
          authors: item.volumeInfo.authors || [],
          publishedDate: item.volumeInfo.publishedDate,
          categories: item.volumeInfo.categories || [],
        },
      }));
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    }
  }

  // TMDb API for movies and TV shows
  async searchMovies(query: string, page: number = 1): Promise<ContentItem[]> {
    try {
      // For demo purposes, return mock data since we don't have a real API key
      // In production, uncomment the real API call below
      
      /*
      const response = await fetch(
        `${this.TMDB_BASE_URL}/search/movie?api_key=${this.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      );
      
      if (!response.ok) {
        throw new Error('TMDb API request failed');
      }
      
      const data: TMDbSearchResponse = await response.json();
      
      return data.results.map((movie) => ({
        id: movie.id.toString(),
        title: movie.title,
        description: this.truncateDescription(movie.overview || 'No overview available'),
        image: movie.poster_path 
          ? `${this.TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'Movies',
        additionalData: {
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
          genreIds: movie.genre_ids,
          backdropPath: movie.backdrop_path,
        },
      }));
      */

      // Mock data for demo
      return this.getMockMovies(query);
    } catch (error) {
      console.error('TMDb search error:', error);
      return this.getMockMovies(query);
    }
  }

  // TV Shows search
  async searchTVShows(query: string, page: number = 1): Promise<ContentItem[]> {
    try {
      // Mock data for demo - in production, use real TMDb TV API
      return this.getMockTVShows(query);
    } catch (error) {
      console.error('TV Shows search error:', error);
      return [];
    }
  }

  // Spotify API - Enhanced (requires OAuth)
  async searchMusic(query: string, accessToken?: string): Promise<ContentItem[]> {
    if (!accessToken) {
      // Return mock data if no token
      return this.getMockMusic(query);
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Spotify API request failed');
      }
      
      const data: SpotifySearchResult = await response.json();
      
      return data.tracks.items.map((track) => ({
        id: track.id,
        title: `${track.name} - ${track.artists.map(a => a.name).join(', ')}`,
        description: `Album: ${track.album.name} (${track.album.release_date?.split('-')[0] || 'Unknown'})`,
        image: track.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        source: 'spotify' as const,
        category: 'Music',
        additionalData: {
          artists: track.artists.map(a => a.name),
          album: track.album.name,
          releaseDate: track.album.release_date,
          duration: track.duration_ms,
          previewUrl: track.preview_url,
        },
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      return this.getMockMusic(query);
    }
  }

  // Combined search across all APIs
  async searchAll(query: string, category?: string): Promise<ContentItem[]> {
    const results: ContentItem[] = [];
    const searchPromises: Promise<ContentItem[]>[] = [];

    try {
      if (!category || category === 'Articles') {
        searchPromises.push(
          this.searchWikipedia(query).then(result => result ? [result] : [])
        );
      }

      if (!category || category === 'Books') {
        searchPromises.push(this.searchBooks(query, 5));
      }

      if (!category || category === 'Movies') {
        searchPromises.push(this.searchMovies(query));
      }

      if (!category || category === 'TV Shows') {
        searchPromises.push(this.searchTVShows(query));
      }

      if (!category || category === 'Music') {
        searchPromises.push(this.searchMusic(query));
      }

      const allResults = await Promise.allSettled(searchPromises);
      
      allResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        }
      });

      // Shuffle and limit results
      return this.shuffleArray(results).slice(0, 20);
    } catch (error) {
      console.error('Combined search error:', error);
      return results;
    }
  }

  // Utility methods
  private truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Mock data methods for demo purposes
  private getMockMovies(query: string): ContentItem[] {
    const movies = [
      {
        id: 'movie-1',
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'Movies',
        additionalData: { releaseDate: '1994-09-23', voteAverage: 9.3 },
      },
      {
        id: 'movie-2',
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'Movies',
        additionalData: { releaseDate: '1972-03-24', voteAverage: 9.2 },
      },
      {
        id: 'movie-3',
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'Movies',
        additionalData: { releaseDate: '1994-10-14', voteAverage: 8.9 },
      },
    ];

    return movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  private getMockTVShows(query: string): ContentItem[] {
    const shows = [
      {
        id: 'tv-1',
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
        image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'TV Shows',
        additionalData: { firstAirDate: '2008-01-20', voteAverage: 9.5 },
      },
      {
        id: 'tv-2',
        title: 'The Bear',
        description: 'A young chef from the fine dining world returns to Chicago to run his family\'s Italian beef sandwich shop.',
        image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
        source: 'tmdb' as const,
        category: 'TV Shows',
        additionalData: { firstAirDate: '2022-06-23', voteAverage: 8.7 },
      },
    ];

    return shows.filter(show => 
      show.title.toLowerCase().includes(query.toLowerCase()) ||
      show.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  private getMockMusic(query: string): ContentItem[] {
    const music = [
      {
        id: 'music-1',
        title: 'Bohemian Rhapsody - Queen',
        description: 'Album: A Night at the Opera (1975)',
        image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        source: 'spotify' as const,
        category: 'Music',
        additionalData: { artists: ['Queen'], album: 'A Night at the Opera' },
      },
      {
        id: 'music-2',
        title: 'Hotel California - Eagles',
        description: 'Album: Hotel California (1976)',
        image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        source: 'spotify' as const,
        category: 'Music',
        additionalData: { artists: ['Eagles'], album: 'Hotel California' },
      },
    ];

    return music.filter(track => 
      track.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const apiService = new ApiService();