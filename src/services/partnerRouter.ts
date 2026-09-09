import { ChannelPartner, RankedPartner } from '../types/partner';
import { MinistryAgency } from '../types/scheme';
import { CHANNEL_PARTNERS_DATABASE } from '../data/partnersData';

export class PartnerRouterService {
  /**
   * Haversine distance in kilometers
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Ranks partners using composite reliability and load-balancing weights
   */
  public static rankPartners(
    userLat: number,
    userLng: number,
    agencyFilter?: MinistryAgency,
    districtFilter?: string,
    partners: ChannelPartner[] = CHANNEL_PARTNERS_DATABASE
  ): RankedPartner[] {
    // Default to Indore center if user coordinates not available
    const baseLat = userLat || 22.7196;
    const baseLng = userLng || 75.8577;

    // Filter eligible partners
    const filtered = partners.filter(p => {
      if (agencyFilter && !p.supportedAgencies.includes(agencyFilter)) {
        return false;
      }
      if (districtFilter && districtFilter !== 'ALL' && p.district.toLowerCase() !== districtFilter.toLowerCase()) {
        return false;
      }
      return true;
    });

    const ranked: RankedPartner[] = filtered.map(p => {
      const dist = this.calculateDistance(baseLat, baseLng, p.lat, p.lng);

      // Reliability metrics scoring (0 - 100)
      // 1. Turnaround speed: 3 days = 100 pts, 20 days = 10 pts
      const tatScore = Math.max(10, Math.min(100, 100 - ((p.reliability.averageResponseTimeDays - 3) * 5)));

      // 2. Fund availability: 50% utilized = 100 pts, 95% utilized = 20 pts, 98% = 5 pts
      const fundScore = Math.max(5, 100 - (p.reliability.allocatedFundUtilizationPercent * 0.9));

      // 3. Grievance resolution: 95% = 95 pts
      const grievanceScore = p.reliability.grievanceResolutionRate;

      // 4. Proximity score: closer = better, 0-5km = 100, 20km = 30
      const distScore = Math.max(20, Math.min(100, 100 - (dist * 3.5)));

      // 5. Active intake penalty if paused
      const activeMultiplier = p.acceptingNewApplications ? 1.0 : 0.3;

      // Composite calculation (PRD: Reliability & load-balancing over raw distance)
      // Weights: 35% Turnaround, 25% Fund Availability, 20% Proximity, 20% Grievance
      const composite = Math.round(
        (tatScore * 0.35 + fundScore * 0.25 + distScore * 0.20 + grievanceScore * 0.20) * activeMultiplier
      );

      let reliabilityLevel: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'CONGESTED' = 'GOOD';
      if (!p.acceptingNewApplications || p.reliability.allocatedFundUtilizationPercent >= 95) {
        reliabilityLevel = 'CONGESTED';
      } else if (p.reliability.averageResponseTimeDays <= 5.0 && p.reliability.allocatedFundUtilizationPercent <= 75) {
        reliabilityLevel = 'EXCELLENT';
      } else if (p.reliability.averageResponseTimeDays <= 10.0) {
        reliabilityLevel = 'GOOD';
      } else {
        reliabilityLevel = 'AVERAGE';
      }

      let rationale = '';
      if (!p.acceptingNewApplications) {
        rationale = '⚠️ Quota Full: Application processing currently paused due to exhausted annual fund allocation.';
      } else if (p.type === 'SCA') {
        rationale = `🏆 Direct Nodal SCA: Highest sanction success rate (${p.reliability.grievanceResolutionRate}%), fast ${p.reliability.averageResponseTimeDays}-day average turnaround, and ${100 - p.reliability.allocatedFundUtilizationPercent}% fund quota available.`;
      } else if (p.reliability.averageResponseTimeDays <= 8) {
        rationale = `⚡ Fast Track Branch: Active priority-sector credit desk with ${p.reliability.activeApplicationQuota} open application slots this quarter.`;
      } else {
        rationale = `📍 Commercial Branch: Available for application intake, but subject to bank credit queue (${p.reliability.averageResponseTimeDays}-day turnaround).`;
      }

      return {
        ...p,
        distanceKm: dist,
        compositeScore: composite,
        rank: 0,
        rankingRationale: rationale,
        reliabilityLevel
      };
    });

    // Sort descending by composite score
    ranked.sort((a, b) => b.compositeScore - a.compositeScore);

    // Assign 1-indexed ranks
    return ranked.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }
}
