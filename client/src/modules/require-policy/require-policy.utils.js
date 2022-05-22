function asPolicyRegex(policy) {
    return new RegExp(`^${policy.replace(/\*/g, '.*')}$`);
}

function isPolicyAuthorized(policy, action, resource) {
    return asPolicyRegex(policy.action).test(action) 
        && asPolicyRegex(policy.resource).test(resource);
}

export function isAuthorized(user, action, resource) {
    const isAuthorizedPolicy = policy => isPolicyAuthorized(policy, action, resource);
    return user?.rolePolicies?.some(isAuthorizedPolicy);
}