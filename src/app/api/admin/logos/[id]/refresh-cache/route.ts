import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/api-utils'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  // Generate a unique ID for this request for tracking across logs
  // or use the one from the request headers if available
  let requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  try {
    // Get request headers for tracking
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    // Use the client request ID if available, or generate a new one
    requestId = headers['x-request-id'] || requestId;
    const logPrefix = `[CACHE-REFRESH][${requestId}]`;
    
    console.log(`🔄 ${logPrefix} Starting cache refresh for logo ID: ${params.id}`)
    console.time(`${logPrefix} Cache refresh duration`);
    
    // Log request info
    console.log(`📋 ${logPrefix} Request headers:`, JSON.stringify(headers, null, 2))
  
    // Get the logo ID from the params
    const logoId = params.id
    console.log(`📋 ${logPrefix} Processing logo ID: ${logoId}`)
    
    // Create a list of paths to revalidate
    const pathsToRevalidate = [
      '/admin/logos',
      `/admin/logos/${logoId}`,
      '/logos',
      `/logos/${logoId}`,
      '/api/admin/logos',
      `/api/admin/logos/${logoId}`
    ]
    
    console.log(`🧹 ${logPrefix} Revalidating ${pathsToRevalidate.length} paths:`, pathsToRevalidate)
    
    // Track success/failure for each path
    const results: Record<string, boolean> = {};
    
    // Revalidate the paths where logo data might be displayed
    for (const path of pathsToRevalidate) {
      try {
        console.log(`🔄 ${logPrefix} Revalidating path: ${path}`)
        revalidatePath(path)
        results[path] = true;
        console.log(`✅ ${logPrefix} Successfully revalidated: ${path}`)
      } catch (pathError) {
        console.error(`❌ ${logPrefix} Failed to revalidate path ${path}:`, pathError)
        results[path] = false;
      }
    }
    
    const successCount = Object.values(results).filter(Boolean).length;
    console.log(`${logPrefix} Revalidation summary: ${successCount}/${pathsToRevalidate.length} paths successful`)
    
    console.log(`✅ ${logPrefix} Cache revalidation completed for logo ID: ${logoId}`)
    console.timeEnd(`${logPrefix} Cache refresh duration`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Cache refreshed successfully',
        revalidatedPaths: pathsToRevalidate,
        results,
        successCount,
        requestId,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Request-ID': requestId
        }
      }
    )
  } catch (error) {
    const logPrefix = requestId ? `[CACHE-REFRESH][${requestId}]` : '[CACHE-REFRESH]';
    console.error(`❌ ${logPrefix} Failed to refresh cache:`, error)
    
    // Log stack trace for better debugging
    if (error instanceof Error && error.stack) {
      console.error(`❌ ${logPrefix} Error stack:`, error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh cache', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        requestId
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-ID': requestId || 'unknown'
        }
      }
    )
  }
} 