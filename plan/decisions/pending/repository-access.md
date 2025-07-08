# PENDING DECISION: Repository Access Control Model

**Status**: 🟡 HIGH PRIORITY  
**Date Raised**: 05-Jul-2025  
**Decision Deadline**: 07-Jul-2025  
**Owner**: Central Team Security Lead  
**Related Doc**: [Repository Isolation Strategy](/plan/architecture/repository-isolation-strategy.md)

## Summary

Define the access control model for the 3-team structure: Claude AI, Central Team, and Independent Developers.

## Current Situation

- 3-team structure approved and documented
- Repository isolation strategy drafted
- Need specific implementation details
- Security vs. collaboration balance required

## Key Questions to Resolve

### 1. Independent Developer Access

- Read-only access to core monorepo?
- Fork and PR model?
- Complete isolation with APIs only?

### 2. Claude AI Repository Access

- Full monorepo access (current)?
- Restricted to specific directories?
- Separate development repositories?

### 3. Cross-Team Collaboration

- How do teams share code?
- Module publishing process?
- Documentation access levels?

## Proposed Model

### Repository Structure

```
sasarjan/                    # GitHub Organization
├── core/                    # Private - Central Team only
│   └── SaSarjan-AppStore/   # Main monorepo
├── modules/                 # Public - All teams
│   ├── @sasarjan/ui/       # Shared components
│   ├── @sasarjan/auth/     # Auth module
│   └── templates/          # Starter templates
└── community/              # Public - Developer contributions
    ├── talentexcel-*       # TalentExcel modules
    ├── sevapremi-*         # SevaPremi modules
    └── 10xgrowth-*         # 10xGrowth modules
```

### Access Matrix

| Repository             | Claude AI    | Central Team | Developers |
| ---------------------- | ------------ | ------------ | ---------- |
| core/SaSarjan-AppStore | Read/Write\* | Admin        | None       |
| modules/@sasarjan/\*   | Read         | Admin        | Read       |
| community/\*           | Read         | Review/Merge | Write      |

\*Claude AI write access with restrictions (no secrets, no deployments)

### Security Controls

1. **Branch Protection**: Main branches protected
2. **Secret Management**: Central Team only
3. **Deployment Keys**: Central Team only
4. **Code Review**: Required for all merges

## Implementation Checklist

- [ ] Create GitHub organization structure
- [ ] Set up repository permissions
- [ ] Configure branch protection rules
- [ ] Document workflow guides
- [ ] Create developer onboarding process
- [ ] Set up CI/CD with proper isolation

## Success Criteria

- Zero security incidents
- Developer productivity maintained
- Clear contribution path
- Automated security scanning
- Audit trail for all changes

## Next Steps

1. Security team review (by 07-Jul)
2. Technical implementation plan
3. Developer documentation
4. Pilot with one module
5. Full rollout

---

**Update Log**:

- 05-Jul: Initial draft created
- 07-Jul: Added proposed access matrix
