// Export everything from providers
export { DataProviderComponent, useDataProvider, useDataProviderStatus, isUsingMockProvider } from './DataContext';
export { apiProvider } from './apiProvider';
export { mockProvider } from './mockProvider';
export * from './types';

// Export mock subscription utilities for demo/testing
export {
  getMockSubscriptionState,
  setMockSubscriptionState,
  changeMockPlan,
  consumeMockCredits,
  addMockCredits,
  purchaseMockRecharge,
  canPerformAction,
  getCurrentPlanLimits,
  getCurrentEstimatorFeatures,
  setDemoScenario,
  resetMockSubscription,
  MOCK_PLANS,
  ACTION_COSTS,
  CREDIT_PACKAGES,
  type MockSubscriptionState,
  type MockPlanConfig,
  type DemoScenario,
} from './mockSubscription';
