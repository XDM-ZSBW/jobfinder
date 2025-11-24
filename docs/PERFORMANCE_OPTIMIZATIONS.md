# Performance Optimizations Guide

## Overview

The platform includes automated performance optimizations that run overnight via WARP workflows. These optimizations ensure optimal database, cache, and search performance.

## Scheduled Optimizations

**Schedule**: Daily at 2 AM (configurable in `warp-workflows/performance-optimizations.yaml`)

**Duration**: ~15-30 minutes depending on data volume

## Optimization Steps

### 1. Database Index Optimization

**What it does:**
- Analyzes table statistics
- Identifies missing indexes
- Reindexes critical tables (CONCURRENTLY to avoid locking)

**Tables optimized:**
- `anonymous_users`
- `llc_profiles`
- `job_postings`
- `capability_assessments`
- `matches`

**Impact**: Faster queries, especially for user lookups and matching

### 2. Redis Cache Optimization

**What it does:**
- Checks cache hit/miss statistics
- Clears expired keys
- Optimizes memory policy (LRU eviction)
- Rewrites configuration

**Impact**: Better cache utilization, reduced memory usage

### 3. Elasticsearch Index Optimization

**What it does:**
- Checks cluster health
- Force merges indexes (reduces segments)
- Refreshes all indexes
- Optimizes index settings

**Impact**: Faster search queries, reduced index size

### 4. Query Performance Analysis

**What it does:**
- Enables slow query logging (>1 second)
- Identifies long-running queries (>5 minutes)
- Provides query analysis

**Impact**: Identifies bottlenecks for optimization

### 5. Frontend Asset Optimization

**What it does:**
- Builds optimized production bundle
- Analyzes bundle size
- Optimizes images (if available)

**Impact**: Faster page loads, reduced bandwidth

### 6. API Response Caching

**What it does:**
- Warms cache with frequently accessed endpoints
- Pre-loads common queries

**Impact**: Faster API responses for popular endpoints

### 7. Database Vacuum and Analyze

**What it does:**
- Vacuums tables (removes dead tuples)
- Updates table statistics
- Optimizes storage

**Impact**: Better query planning, reduced storage

## Manual Execution

### Run All Optimizations

```bash
# Via WARP
warp optimize-performance

# Direct PowerShell
.\scripts\run-performance-optimizations.ps1
```

### Run Specific Optimizations

```bash
# Database only
warp optimize-db
.\scripts\run-performance-optimizations.ps1 -DatabaseOnly

# Cache only
warp optimize-cache
.\scripts\run-performance-optimizations.ps1 -CacheOnly

# Search only
warp optimize-search
.\scripts\run-performance-optimizations.ps1 -SearchOnly
```

## Performance Metrics

After optimizations run, check:

### Database Metrics
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('jobfinder'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cache Metrics
```bash
# Cache hit rate
docker compose exec redis redis-cli INFO stats | grep keyspace

# Memory usage
docker compose exec redis redis-cli INFO memory
```

### Elasticsearch Metrics
```bash
# Cluster health
curl http://localhost:9200/_cluster/health

# Index sizes
curl http://localhost:9200/_cat/indices?v
```

## Monitoring

### Key Metrics to Watch

1. **Database Query Latency**: Should be < 50ms (p99)
2. **Cache Hit Rate**: Should be > 80%
3. **Elasticsearch Query Latency**: Should be < 100ms (p99)
4. **API Response Time**: Should be < 300ms (p99)

### Alerts

Set up alerts for:
- Database query latency > 100ms
- Cache hit rate < 70%
- Elasticsearch cluster status != green
- API response time > 500ms

## Troubleshooting

### Optimizations Taking Too Long

- **Database**: Large tables may take time to reindex
  - Solution: Run during low-traffic hours
  - Use CONCURRENTLY to avoid locking

- **Elasticsearch**: Large indexes may take time to merge
  - Solution: Increase timeout in workflow
  - Consider splitting large indexes

### Optimizations Failing

- **Check logs**: `docker compose logs app`
- **Verify services**: Ensure postgres, redis, elasticsearch are running
- **Check permissions**: Ensure database user has necessary permissions

### Performance Not Improving

- **Review slow query log**: Check for queries not using indexes
- **Check cache hit rate**: May need to adjust cache TTL
- **Review Elasticsearch mappings**: Ensure proper field types

## Customization

### Adjust Schedule

Edit `warp-workflows/performance-optimizations.yaml`:

```yaml
schedule:
  cron: "0 2 * * *"  # Change time here
  timezone: "America/Los_Angeles"
```

### Add Custom Optimizations

Add steps to `warp-workflows/performance-optimizations.yaml`:

```yaml
- name: Custom Optimization
  description: Your custom optimization
  commands:
    - name: Run optimization
      run: your-command-here
```

## Best Practices

1. **Run during low-traffic hours**: Default 2 AM
2. **Monitor first run**: Check logs and metrics
3. **Adjust schedule**: Based on your traffic patterns
4. **Review metrics**: After each optimization run
5. **Document customizations**: Keep track of changes

## Related Documentation

- `docs/SCALING.md` - Scaling strategy
- `business/runbooks/incident-high-latency.md` - High latency troubleshooting
- `business/health/dashboards.md` - Performance dashboards

