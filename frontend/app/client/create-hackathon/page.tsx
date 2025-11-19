'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Loader2, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

const CANISTER_ID = process.env.NEXT_PUBLIC_HACKATHON_CANISTER_ID ?? '';
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST ?? '';

const hackquestIdl = ({ IDL }: typeof import('@dfinity/candid')) => {
  const HackathonStatus = IDL.Variant({
    Draft: IDL.Null,
    Upcoming: IDL.Null,
    Ongoing: IDL.Null,
    Judging: IDL.Null,
    Completed: IDL.Null,
    Cancelled: IDL.Null,
  });

  const CategoryInput = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    rewardSlots: IDL.Nat,
    judgingCriteria: IDL.Vec(IDL.Text),
  });

  const RewardInput = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
    amount: IDL.Nat64,
    rank: IDL.Nat,
    categoryName: IDL.Opt(IDL.Text),
    perks: IDL.Vec(IDL.Text),
  });

  const Hackathon = IDL.Record({
    id: IDL.Text,
    organizer: IDL.Principal,
    title: IDL.Text,
    tagline: IDL.Text,
    summary: IDL.Text,
    bannerUrl: IDL.Text,
    heroVideoUrl: IDL.Text,
    location: IDL.Text,
    theme: IDL.Text,
    prizePool: IDL.Nat64,
    faq: IDL.Vec(IDL.Text),
    resources: IDL.Vec(IDL.Text),
    minTeamSize: IDL.Nat,
    maxTeamSize: IDL.Nat,
    maxTeamsPerCategory: IDL.Nat,
    submissionsOpenAt: IDL.Int,
    submissionsCloseAt: IDL.Int,
    startAt: IDL.Int,
    endAt: IDL.Int,
    createdAt: IDL.Int,
    status: HackathonStatus,
    categories: IDL.Vec(IDL.Text),
    rewards: IDL.Vec(IDL.Text),
  });

  const HackQuestError = IDL.Variant({
    NotFound: IDL.Text,
    ValidationError: IDL.Text,
    InvalidState: IDL.Text,
    NotAuthorized: IDL.Null,
  });

  const CreateHackathonRequest = IDL.Record({
    title: IDL.Text,
    tagline: IDL.Text,
    summary: IDL.Text,
    bannerUrl: IDL.Text,
    heroVideoUrl: IDL.Text,
    location: IDL.Text,
    theme: IDL.Text,
    prizePool: IDL.Nat64,
    faq: IDL.Vec(IDL.Text),
    resources: IDL.Vec(IDL.Text),
    minTeamSize: IDL.Nat,
    maxTeamSize: IDL.Nat,
    maxTeamsPerCategory: IDL.Nat,
    submissionsOpenAt: IDL.Int,
    submissionsCloseAt: IDL.Int,
    startAt: IDL.Int,
    endAt: IDL.Int,
    categories: IDL.Vec(CategoryInput),
    rewards: IDL.Vec(RewardInput),
  });

  return IDL.Service({
    createHackathon: IDL.Func(
      [CreateHackathonRequest, IDL.Principal], // request, organizer principal
      [IDL.Variant({ ok: Hackathon, err: HackQuestError })],
      []
    ),
    listHackathons: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Opt(HackathonStatus)],
      [IDL.Vec(Hackathon)],
      ['query']
    ),
  });
};

const createHackquestActor = async () => {
  if (!CANISTER_ID) {
    throw new Error('NEXT_PUBLIC_HACKATHON_CANISTER_ID is not configured');
  }
  const agent = new HttpAgent({ host: IC_HOST });
  if (IC_HOST.includes('127.0.0.1') || IC_HOST.includes('localhost')) {
    await agent.fetchRootKey();
  }
  return Actor.createActor(hackquestIdl as any, { agent, canisterId: CANISTER_ID });
};

const emptyCategory = { name: '', description: '', rewardSlots: 1, judgingCriteria: [''] };
const emptyReward = { title: '', description: '', amount: '', rank: 1, categoryName: '', perks: [''] };

const buildTimestamp = (value: string) => {
  if (!value) return BigInt(0);
  const millis = Date.parse(value);
  return BigInt(millis) * BigInt(1_000_000);
};

const sanitizeTextArray = (items: string[]) => items.map(item => item.trim()).filter(Boolean);

const CreateHackathonPage = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPrincipal, setUserPrincipal] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    tagline: '',
    summary: '',
    bannerUrl: '',
    heroVideoUrl: '',
    location: '',
    theme: '',
    prizePool: '',
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeamsPerCategory: 20,
    submissionsOpenAt: '',
    submissionsCloseAt: '',
    startAt: '',
    endAt: '',
    faq: [''],
    resources: [''],
    categories: [emptyCategory],
    rewards: [emptyReward],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hackathonList, setHackathonList] = useState<any[]>([]);

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (
    key: 'faq' | 'resources',
    index: number,
    value: string
  ) => {
    const next = [...form[key]];
    next[index] = value;
    updateForm(key, next);
  };

  const addSimpleRow = (key: 'faq' | 'resources') => {
    updateForm(key, [...form[key], '']);
  };

  const removeSimpleRow = (key: 'faq' | 'resources', index: number) => {
    const next = form[key].filter((_, i) => i !== index);
    updateForm(key, next.length ? next : ['']);
  };

  const updateCategory = (index: number, field: keyof typeof emptyCategory, value: any) => {
    const next = [...form.categories];
    next[index] = { ...next[index], [field]: value };
    updateForm('categories', next);
  };

  const updateCategoryCriteria = (catIndex: number, critIndex: number, value: string) => {
    const next = [...form.categories];
    const criteria = [...next[catIndex].judgingCriteria];
    criteria[critIndex] = value;
    next[catIndex].judgingCriteria = criteria;
    updateForm('categories', next);
  };

  const addCategoryCriterion = (catIndex: number) => {
    const next = [...form.categories];
    next[catIndex].judgingCriteria = [...next[catIndex].judgingCriteria, ''];
    updateForm('categories', next);
  };

  const removeCategoryCriterion = (catIndex: number, critIndex: number) => {
    const next = [...form.categories];
    const filtered = next[catIndex].judgingCriteria.filter((_, i) => i !== critIndex);
    next[catIndex].judgingCriteria = filtered.length ? filtered : [''];
    updateForm('categories', next);
  };

  const updateReward = (index: number, field: keyof typeof emptyReward, value: any) => {
    const next = [...form.rewards];
    next[index] = { ...next[index], [field]: value };
    updateForm('rewards', next);
  };

  const updateRewardPerk = (rewardIndex: number, perkIndex: number, value: string) => {
    const next = [...form.rewards];
    const perks = [...next[rewardIndex].perks];
    perks[perkIndex] = value;
    next[rewardIndex].perks = perks;
    updateForm('rewards', next);
  };

  const addRewardPerk = (rewardIndex: number) => {
    const next = [...form.rewards];
    next[rewardIndex].perks = [...next[rewardIndex].perks, ''];
    updateForm('rewards', next);
  };

  const removeRewardPerk = (rewardIndex: number, perkIndex: number) => {
    const next = [...form.rewards];
    const filtered = next[rewardIndex].perks.filter((_, i) => i !== perkIndex);
    next[rewardIndex].perks = filtered.length ? filtered : [''];
    updateForm('rewards', next);
  };

  const addCategory = () => {
    updateForm('categories', [...form.categories, { ...emptyCategory }]);
  };

  const removeCategory = (index: number) => {
    const next = form.categories.filter((_, i) => i !== index);
    updateForm('categories', next.length ? next : [{ ...emptyCategory }]);
  };

  const addReward = () => {
    updateForm('rewards', [...form.rewards, { ...emptyReward }]);
  };

  const removeReward = (index: number) => {
    const next = form.rewards.filter((_, i) => i !== index);
    updateForm('rewards', next.length ? next : [{ ...emptyReward }]);
  };

  const resetForm = () => {
    setForm({
      title: '',
      tagline: '',
      summary: '',
      bannerUrl: '',
      heroVideoUrl: '',
      location: '',
      theme: '',
      prizePool: '',
      minTeamSize: 1,
      maxTeamSize: 4,
      maxTeamsPerCategory: 20,
      submissionsOpenAt: '',
      submissionsCloseAt: '',
      startAt: '',
      endAt: '',
      faq: [''],
      resources: [''],
      categories: [{ ...emptyCategory }],
      rewards: [{ ...emptyReward }],
    });
  };

  const fetchHackathons = useCallback(async () => {
    try {
      setIsLoadingList(true);
      const actor: any = await createHackquestActor();
      const data = await actor.listHackathons(BigInt(20), BigInt(0), []);
      setHackathonList(data);
    } catch (error) {
      console.error('Failed to load hackathons', error);
      setStatusMessage({ type: 'error', text: 'Unable to load hackathons from canister.' });
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Get user email and principal from session
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.session?.email) {
            setUserEmail(data.session.email);
            
            // Get principal from email via API
            try {
              const principalResponse = await fetch(`/api/hackquest/participants/email-to-principal?email=${encodeURIComponent(data.session.email)}`);
              if (principalResponse.ok) {
                const principalData = await principalResponse.json();
                if (principalData.success && principalData.principal) {
                  setUserPrincipal(principalData.principal);
                }
              }
            } catch (error) {
              console.error('Error getting principal:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    };
    getUserInfo();
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (!form.title.trim() || !form.summary.trim()) {
        throw new Error('Title and summary are required.');
      }

      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        summary: form.summary.trim(),
        bannerUrl: form.bannerUrl.trim(),
        heroVideoUrl: form.heroVideoUrl.trim(),
        location: form.location.trim(),
        theme: form.theme.trim(),
        prizePool: BigInt(Math.max(Number(form.prizePool) || 0, 0)),
        faq: sanitizeTextArray(form.faq),
        resources: sanitizeTextArray(form.resources),
        minTeamSize: BigInt(Math.max(form.minTeamSize, 1)),
        maxTeamSize: BigInt(Math.max(form.maxTeamSize, form.minTeamSize)),
        maxTeamsPerCategory: BigInt(Math.max(form.maxTeamsPerCategory, 1)),
        submissionsOpenAt: buildTimestamp(form.submissionsOpenAt),
        submissionsCloseAt: buildTimestamp(form.submissionsCloseAt),
        startAt: buildTimestamp(form.startAt),
        endAt: buildTimestamp(form.endAt),
        categories: form.categories.map(category => ({
          name: category.name.trim(),
          description: category.description.trim(),
          rewardSlots: BigInt(Math.max(category.rewardSlots, 1)),
          judgingCriteria: sanitizeTextArray(category.judgingCriteria),
        })),
        rewards: form.rewards.map(reward => ({
          title: reward.title.trim(),
          description: reward.description.trim(),
          amount: BigInt(Math.max(Number(reward.amount) || 0, 0)),
          rank: BigInt(Math.max(reward.rank, 1)),
          categoryName: reward.categoryName.trim() ? [reward.categoryName.trim()] : [],
          perks: sanitizeTextArray(reward.perks),
        })),
      };

      if (!userEmail) {
        throw new Error('Please login to create a hackathon.');
      }

      // Ensure we have the principal
      let principalToUse = userPrincipal;
      if (!principalToUse) {
        try {
          const principalResponse = await fetch(`/api/hackquest/participants/email-to-principal?email=${encodeURIComponent(userEmail)}`);
          if (principalResponse.ok) {
            const principalData = await principalResponse.json();
            if (principalData.success && principalData.principal) {
              principalToUse = principalData.principal;
              setUserPrincipal(principalData.principal);
            } else {
              throw new Error('Could not determine your identity. Please try refreshing the page.');
            }
          } else {
            throw new Error('Could not determine your identity. Please try refreshing the page.');
          }
        } catch (error) {
          throw new Error('Could not determine your identity. Please try refreshing the page.');
        }
      }

      const actor: any = await createHackquestActor();
      const organizerPrincipal = Principal.fromText(principalToUse!);
      const result = await actor.createHackathon(payload, organizerPrincipal);

      if ('ok' in result) {
        setStatusMessage({ type: 'success', text: 'Hackathon saved to the canister!' });
        resetForm();
        fetchHackathons();
      } else {
        const errorVariant = result.err;
        const key = Object.keys(errorVariant)[0] as keyof typeof errorVariant;
        const details =
          typeof errorVariant[key] === 'string'
            ? errorVariant[key]
            : 'Unknown error from canister';
        throw new Error(details);
      }
    } catch (error) {
      console.error('Failed to save hackathon', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save hackathon details.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStatus = (status: any) => {
    if (!status) return 'Unknown';
    return Object.keys(status)[0];
  };

  const formatDate = (timestamp: bigint) => {
    if (!timestamp || timestamp === BigInt(0)) return 'TBD';
    const millis = Number(timestamp / BigInt(1_000_000));
    return new Date(millis).toLocaleString();
  };

  const totalCategories = form.categories.length;
  const totalRewards = form.rewards.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Create a Hackathon</h1>
          <p className="text-gray-600">
            Fill out the required details and publish directly to the ICP testnet canister.
          </p>
        </header>

        {statusMessage && (
          <div
            className={`flex items-center gap-3 rounded-md p-4 text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">
                These fields map directly to the HackQuest canister.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Title *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="HackQuest Global Build"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Tagline</span>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => updateForm('tagline', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Build the future on ICP"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Banner URL</span>
                <input
                  type="url"
                  value={form.bannerUrl}
                  onChange={e => updateForm('bannerUrl', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="https://..."
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Hero Video URL</span>
                <input
                  type="url"
                  value={form.heroVideoUrl}
                  onChange={e => updateForm('heroVideoUrl', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-sm font-medium text-gray-700">Summary *</span>
              <textarea
                value={form.summary}
                onChange={e => updateForm('summary', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
                placeholder="Describe the hackathon..."
                required
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => updateForm('location', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Global / Remote"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Theme</span>
                <input
                  type="text"
                  value={form.theme}
                  onChange={e => updateForm('theme', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="DeFi, AI, Social..."
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Prize Pool (ICP)</span>
                <input
                  type="number"
                  min={0}
                  value={form.prizePool}
                  onChange={e => updateForm('prizePool', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="1000"
                />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
              <p className="text-sm text-gray-500">Stored as nanosecond timestamps in the canister.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Submissions Open At</span>
                <input
                  type="datetime-local"
                  value={form.submissionsOpenAt}
                  onChange={e => updateForm('submissionsOpenAt', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Submissions Close At</span>
                <input
                  type="datetime-local"
                  value={form.submissionsCloseAt}
                  onChange={e => updateForm('submissionsCloseAt', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Hackathon Starts</span>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={e => updateForm('startAt', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Hackathon Ends</span>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={e => updateForm('endAt', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Settings</h2>
              <p className="text-sm text-gray-500">Validations run before sending data to the canister.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Min Team Size</span>
                <input
                  type="number"
                  min={1}
                  value={form.minTeamSize}
                  onChange={e => updateForm('minTeamSize', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Max Team Size</span>
                <input
                  type="number"
                  min={form.minTeamSize}
                  value={form.maxTeamSize}
                  onChange={e => updateForm('maxTeamSize', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Max Teams / Category</span>
                <input
                  type="number"
                  min={1}
                  value={form.maxTeamsPerCategory}
                  onChange={e => updateForm('maxTeamsPerCategory', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
                <p className="text-sm text-gray-500">Stored as an array of Text values.</p>
              </div>
              <button
                type="button"
                onClick={() => addSimpleRow('faq')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {form.faq.map((value, index) => (
                <div key={`faq-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={e => handleArrayChange('faq', index, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    placeholder="What is the project submission deadline?"
                  />
                  <button
                    type="button"
                    onClick={() => removeSimpleRow('faq', index)}
                    className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
                <p className="text-sm text-gray-500">Share documentation or helpful links.</p>
              </div>
              <button
                type="button"
                onClick={() => addSimpleRow('resources')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </button>
            </div>

            <div className="space-y-3">
              {form.resources.map((value, index) => (
                <div key={`resource-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={e => handleArrayChange('resources', index, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    placeholder="https://guide.icp.xyz"
                  />
                  <button
                    type="button"
                    onClick={() => removeSimpleRow('resources', index)}
                    className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Categories ({totalCategories})</h2>
                <p className="text-sm text-gray-500">Each entry becomes a category record in the canister.</p>
              </div>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>

            <div className="space-y-6">
              {form.categories.map((category, catIndex) => (
                <div key={`category-${catIndex}`} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Category #{catIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIndex)}
                      className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Name</span>
                      <input
                        type="text"
                        value={category.name}
                        onChange={e => updateCategory(catIndex, 'name', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="AI Track"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Reward Slots</span>
                      <input
                        type="number"
                        min={1}
                        value={category.rewardSlots}
                        onChange={e => updateCategory(catIndex, 'rewardSlots', Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </label>
                  </div>

                  <label className="space-y-1 block">
                    <span className="text-sm font-medium text-gray-700">Description</span>
                    <textarea
                      value={category.description}
                      onChange={e => updateCategory(catIndex, 'description', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      rows={3}
                      placeholder="Focus on intelligent agents, automation..."
                    />
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Judging Criteria</span>
                      <button
                        type="button"
                        onClick={() => addCategoryCriterion(catIndex)}
                        className="inline-flex items-center px-2 py-1 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Criterion
                      </button>
                    </div>

                    {category.judgingCriteria.map((criterion, critIndex) => (
                      <div key={`criteria-${catIndex}-${critIndex}`} className="flex gap-2">
                        <input
                          type="text"
                          value={criterion}
                          onChange={e => updateCategoryCriteria(catIndex, critIndex, e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Innovation, UI/UX..."
                        />
                        <button
                          type="button"
                          onClick={() => removeCategoryCriterion(catIndex, critIndex)}
                          className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Rewards ({totalRewards})</h2>
                <p className="text-sm text-gray-500">Each reward can reference a category by name.</p>
              </div>
              <button
                type="button"
                onClick={addReward}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </button>
            </div>

            <div className="space-y-6">
              {form.rewards.map((reward, rewardIndex) => (
                <div key={`reward-${rewardIndex}`} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Reward #{rewardIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeReward(rewardIndex)}
                      className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Title</span>
                      <input
                        type="text"
                        value={reward.title}
                        onChange={e => updateReward(rewardIndex, 'title', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Grand Prize"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Amount (ICP)</span>
                      <input
                        type="number"
                        min={0}
                        value={reward.amount}
                        onChange={e => updateReward(rewardIndex, 'amount', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Rank</span>
                      <input
                        type="number"
                        min={1}
                        value={reward.rank}
                        onChange={e => updateReward(rewardIndex, 'rank', Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Category Name (optional)</span>
                      <input
                        type="text"
                        value={reward.categoryName}
                        onChange={e => updateReward(rewardIndex, 'categoryName', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="AI Track"
                      />
                    </label>
                  </div>

                  <label className="space-y-1 block">
                    <span className="text-sm font-medium text-gray-700">Description</span>
                    <textarea
                      value={reward.description}
                      onChange={e => updateReward(rewardIndex, 'description', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      rows={3}
                      placeholder="Awarded to the best overall project..."
                    />
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Perks</span>
                      <button
                        type="button"
                        onClick={() => addRewardPerk(rewardIndex)}
                        className="inline-flex items-center px-2 py-1 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Perk
                      </button>
                    </div>

                    {reward.perks.map((perk, perkIndex) => (
                      <div key={`perk-${rewardIndex}-${perkIndex}`} className="flex gap-2">
                        <input
                          type="text"
                          value={perk}
                          onChange={e => updateRewardPerk(rewardIndex, perkIndex, e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                          placeholder="Mentorship session"
                        />
                        <button
                          type="button"
                          onClick={() => removeRewardPerk(rewardIndex, perkIndex)}
                          className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save to Canister
            </button>
          </div>
        </form>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Live Hackathons (Freelancer View)</h2>
              <p className="text-sm text-gray-500">
                Data is fetched directly from the ICP testnet canister.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchHackathons}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              {isLoadingList ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Loader2 className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>

          {isLoadingList ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading hackathons...
            </div>
          ) : hackathonList.length === 0 ? (
            <div className="text-sm text-gray-500">No hackathons available on the canister yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathonList.map((hackathon: any) => (
                <div key={hackathon.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{hackathon.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {formatStatus(hackathon.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{hackathon.tagline}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <strong>Theme:</strong> {hackathon.theme || '—'}
                    </p>
                    <p>
                      <strong>Location:</strong> {hackathon.location || '—'}
                    </p>
                    <p>
                      <strong>Prize Pool:</strong> {hackathon.prizePool?.toString() ?? '0'} ICP
                    </p>
                    <p>
                      <strong>Starts:</strong> {formatDate(hackathon.startAt)}
                    </p>
                    <p>
                      <strong>Ends:</strong> {formatDate(hackathon.endAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CreateHackathonPage;