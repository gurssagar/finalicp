import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// Test API for marketplace canister integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, testData } = body;

    // Choose which agent to use based on test environment
    const useRealCanister = process.env.NODE_ENV === 'production' || testData?.useRealCanister;
    const actor = useRealCanister ? await getMarketplaceActor() : mockMarketplaceAgent;

    switch (action) {
      case 'createService': {
        const serviceData = {
          title: testData?.title || 'Test Web Design Service',
          main_category: testData?.main_category || 'Web Designer',
          sub_category: testData?.sub_category || 'UI/UX Design',
          description: testData?.description || 'Professional web design service for modern websites',
          whats_included: testData?.whats_included || 'Custom design, responsive layout, SEO optimization',
          cover_image_url: testData?.cover_image_url || 'https://example.com/cover.jpg',
          portfolio_images: testData?.portfolio_images || [
            'https://example.com/portfolio1.jpg',
            'https://example.com/portfolio2.jpg'
          ],
          faqs: testData?.faqs || [
            {
              id: '1',
              question: 'How long does a typical website design take?',
              answer: 'Usually 2-3 weeks for a standard business website.'
            },
            {
              id: '2',
              question: 'Do you provide ongoing support?',
              answer: 'Yes, I offer 30 days of free support after project completion.'
            }
          ],
          client_questions: testData?.client_questions || [
            {
              id: '1',
              type: 'text',
              question: 'What is your business industry?',
              required: true
            }
          ],
          status: 'Active'
        };

        const result = await actor.createService(testData?.userId || 'test-user-123', serviceData);

        if ('ok' in result) {
          return NextResponse.json({
            success: true,
            action: 'createService',
            data: result.ok,
            message: 'Service created successfully',
            usedRealCanister: useRealCanister
          });
        } else {
          return NextResponse.json({
            success: false,
            action: 'createService',
            error: result.err,
            usedRealCanister: useRealCanister
          }, { status: 400 });
        }
      }

      case 'createPackage': {
        const packageData = {
          service_id: testData?.service_id || 'test-service-id',
          tier: testData?.tier || 'Basic',
          title: testData?.title || 'Basic Website Package',
          description: testData?.description || 'Perfect for small businesses and startups',
          price_e8s: testData?.price_e8s || 500000000n, // 5 ICP
          delivery_days: testData?.delivery_days || 7,
          features: testData?.features || [
            'Custom homepage design',
            'Mobile responsive layout',
            'Basic SEO setup',
            'Contact form integration'
          ],
          revisions_included: testData?.revisions_included || 2,
          status: 'Available'
        };

        const result = await actor.createPackage(testData?.userId || 'test-user-123', packageData);

        if ('ok' in result) {
          return NextResponse.json({
            success: true,
            action: 'createPackage',
            data: result.ok,
            message: 'Package created successfully',
            usedRealCanister: useRealCanister
          });
        } else {
          return NextResponse.json({
            success: false,
            action: 'createPackage',
            error: result.err,
            usedRealCanister: useRealCanister
          }, { status: 400 });
        }
      }

      case 'listServices': {
        const filter = {
          category: testData?.category || undefined,
          freelancer_id: testData?.freelancer_id || undefined,
          search_term: testData?.search_term || '',
          limit: testData?.limit || 10,
          offset: testData?.offset || 0
        };

        const result = await actor.listServices(filter);

        if ('ok' in result) {
          return NextResponse.json({
            success: true,
            action: 'listServices',
            data: result.ok,
            count: result.ok.length,
            message: `Found ${result.ok.length} services`,
            usedRealCanister: useRealCanister
          });
        } else {
          return NextResponse.json({
            success: false,
            action: 'listServices',
            error: result.err,
            usedRealCanister: useRealCanister
          }, { status: 400 });
        }
      }

      case 'getStats': {
        const result = await actor.getStats();

        if (result) {
          return NextResponse.json({
            success: true,
            action: 'getStats',
            data: result,
            message: 'Marketplace stats retrieved successfully',
            usedRealCanister: useRealCanister
          });
        } else {
          return NextResponse.json({
            success: false,
            action: 'getStats',
            error: 'Failed to retrieve stats',
            usedRealCanister: useRealCanister
          }, { status: 500 });
        }
      }

      case 'fullFlowTest': {
        // Test complete service creation flow
        const testResults = [];

        // 1. Create service
        const serviceData = {
          title: 'Full Flow Test Service',
          main_category: 'Web Designer',
          sub_category: 'UI/UX Design',
          description: 'Test service for full flow verification',
          whats_included: 'Test inclusions',
          cover_image_url: 'https://example.com/test-cover.jpg',
          portfolio_images: ['https://example.com/test-portfolio.jpg'],
          faqs: [
            {
              id: '1',
              question: 'Test FAQ Question?',
              answer: 'Test FAQ Answer'
            }
          ],
          client_questions: [
            {
              id: '1',
              type: 'text',
              question: 'Test client question?',
              required: false
            }
          ],
          status: 'Active'
        };

        const serviceResult = await actor.createService('test-user-456', serviceData);

        if ('ok' in serviceResult) {
          testResults.push({
            step: 'createService',
            success: true,
            data: serviceResult.ok
          });

          // 2. Create package
          const packageData = {
            service_id: serviceResult.ok.service_id,
            tier: 'Basic',
            title: 'Test Package',
            description: 'Test package description',
            price_e8s: 1000000000n, // 10 ICP
            delivery_days: 5,
            features: ['Test feature 1', 'Test feature 2'],
            revisions_included: 1,
            status: 'Available'
          };

          const packageResult = await actor.createPackage('test-user-456', packageData);

          if ('ok' in packageResult) {
            testResults.push({
              step: 'createPackage',
              success: true,
              data: packageResult.ok
            });
          } else {
            testResults.push({
              step: 'createPackage',
              success: false,
              error: packageResult.err
            });
          }
        } else {
          testResults.push({
            step: 'createService',
            success: false,
            error: serviceResult.err
          });
        }

        const allSuccessful = testResults.every(r => r.success);

        return NextResponse.json({
          success: allSuccessful,
          action: 'fullFlowTest',
          data: testResults,
          message: allSuccessful ? 'Full flow test completed successfully' : 'Full flow test had failures',
          usedRealCanister: useRealCanister
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Marketplace test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET /api/marketplace/test - Test marketplace connection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const useRealCanister = searchParams.get('useRealCanister') === 'true';

    const actor = useRealCanister ? await getMarketplaceActor() : mockMarketplaceAgent;

    // Test basic connectivity
    const stats = await actor.getStats();

    return NextResponse.json({
      success: true,
      message: 'Marketplace API is accessible',
      stats,
      usedRealCanister: useRealCanister,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Marketplace connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}