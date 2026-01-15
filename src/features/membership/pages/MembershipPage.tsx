import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, X, Sparkles, MessageSquare, Eye, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useGetPlansQuery, useGetMembershipSummaryQuery } from '@/store/api/membershipApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { MembershipPlan, PlanType } from '@/types';

const planIcons: Record<PlanType, string> = {
  free: '🆓',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

const planColors: Record<PlanType, string> = {
  free: 'border-border',
  silver: 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100',
  gold: 'border-accent bg-gradient-to-br from-accent-50 to-amber-50',
  platinum: 'border-primary bg-gradient-to-br from-primary-50 to-purple-50',
};

export function MembershipPage() {
  const dispatch = useAppDispatch();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('gold');
  
  const { data: plansData } = useGetPlansQuery();
  const { data: summaryData } = useGetMembershipSummaryQuery();

  const plans = plansData?.data || [];
  const currentMembership = summaryData?.data;

  const handleUpgrade = (_planId: PlanType) => {
    // TODO: Integrate with Razorpay
    dispatch(addToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Payment integration will be available soon',
    }));
  };

  const features = [
    { name: 'View Contact Details', key: 'viewContacts', icon: Eye },
    { name: 'Unlimited Interests', key: 'unlimitedInterests', icon: Sparkles },
    { name: 'Direct Messaging', key: 'messaging', icon: MessageSquare },
    { name: 'View Private Photos', key: 'viewPrivatePhotos', icon: Lock },
    { name: 'Priority Listing', key: 'priorityListing', icon: Star },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-5xl mx-auto py-2"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-semibold text-text">
          Choose Your Plan
        </h1>
        <p className="text-text-secondary mt-2 max-w-md mx-auto">
          Unlock premium features and find your perfect match faster
        </p>
      </div>

      {/* Current Plan Summary */}
      {currentMembership && (
        <Card className={currentMembership.isPremium ? 'border-accent' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Membership</CardTitle>
              {currentMembership.isPremium && (
                <Badge variant="gold">Premium Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Plan</p>
                <p className="font-semibold capitalize">{currentMembership.currentPlan}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Expires</p>
                <p className="font-semibold">
                  {currentMembership.isPremium ? formatDate(currentMembership.expiresAt) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Contacts Used</p>
                <p className="font-semibold">
                  {currentMembership.contactsUsed} / {currentMembership.contactsAllowed}
                </p>
                <Progress 
                  value={(currentMembership.contactsUsed / currentMembership.contactsAllowed) * 100}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.filter((p: MembershipPlan) => p.id !== 'free').map((plan: MembershipPlan, index: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'relative overflow-hidden transition-all duration-300 cursor-pointer',
                planColors[plan.id],
                selectedPlan === plan.id
                  ? 'ring-2 ring-primary scale-105 shadow-xl'
                  : 'hover:shadow-lg'
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Popular Badge */}
              {plan.id === 'gold' && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">{planIcons[plan.id]}</div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  {plan.discountedPrice < plan.price && (
                    <span className="text-sm text-text-muted line-through mr-2">
                      {formatCurrency(plan.price)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-text">
                    {formatCurrency(plan.discountedPrice)}
                  </span>
                  <span className="text-text-secondary ml-1">
                    / {plan.validityDays} days
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-primary">{plan.contactsAllowed}</span> contact views
                  </p>
                </div>

                <div className="space-y-3">
                  {features.map((feature) => {
                    const hasFeature = plan.features[feature.key as keyof typeof plan.features];
                    return (
                      <div key={feature.key} className="flex items-center gap-3">
                        {hasFeature ? (
                          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-success" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-error/10 flex items-center justify-center">
                            <X className="w-3 h-3 text-error" />
                          </div>
                        )}
                        <span className={cn(
                          'text-sm',
                          hasFeature ? 'text-text' : 'text-text-muted'
                        )}>
                          {feature.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  className="w-full mt-4"
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(plan.id);
                  }}
                >
                  {currentMembership?.currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Why Go Premium?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: 'View Contacts', desc: 'See phone numbers and connect directly' },
              { icon: MessageSquare, title: 'Direct Chat', desc: 'Message any profile without restrictions' },
              { icon: Lock, title: 'Private Photos', desc: 'Access private albums of profiles' },
              { icon: Star, title: 'Priority Listing', desc: 'Get more visibility in search results' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-text mb-1">{item.title}</h4>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span>Secure Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span>Instant Activation</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span>24/7 Support</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span>100% Privacy</span>
        </div>
      </div>
    </motion.div>
  );
}

