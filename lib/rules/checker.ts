const LIST_CHECKER = 'list_checker';
const RANGE_CHECKER = 'range_checker';
const REGEX_MATCHER = 'regex_matcher';
const VALUE_CHECKER = 'value_checker';

export type RuleType = typeof LIST_CHECKER | typeof RANGE_CHECKER | typeof REGEX_MATCHER | typeof VALUE_CHECKER;

type RuleTypeForValueChecker = {
    type: typeof VALUE_CHECKER;
    value: string | boolean | number;
}

type RuleTypeForListChecker = {
    type: typeof LIST_CHECKER;
    value: (string | boolean | number)[];
}

type RuleTypeForRangeChecker = {
    type: typeof RANGE_CHECKER;
    value: { min: number; max: number }[];
}

type RuleTypeForRegexMatcher = {
    type: typeof REGEX_MATCHER;
    value: string;
}

export type FeatureDefinition = {
    id: string;
    description: string;
    rule: RuleTypeForListChecker | RuleTypeForValueChecker | RuleTypeForRangeChecker | RuleTypeForRegexMatcher;
    state: {
        is_enabled: boolean;
        is_expired?: boolean;
        created_at?: number;
        expires_at?: number;
    };
}

export type RuleCheck = {
    checks: {
        value: boolean,
    },
    state: {
        is_enabled: boolean,
        is_expired?: boolean,
        created_at?: number,
        expires_at?: number,
    }
}

function isValueChecker(rule: FeatureDefinition['rule']): rule is RuleTypeForValueChecker {
    return rule.type === VALUE_CHECKER;
}

function isListChecker(rule: FeatureDefinition['rule']): rule is RuleTypeForListChecker {
    return rule.type === LIST_CHECKER;
}

function isRangeChecker(rule: FeatureDefinition['rule']): rule is RuleTypeForRangeChecker {
    return rule.type === RANGE_CHECKER;
}

function isRegexMatcher(rule: FeatureDefinition['rule']): rule is RuleTypeForRegexMatcher {
    return rule.type === REGEX_MATCHER;
}

function getCheckedValue(featureDefinition: FeatureDefinition, value: boolean | string | number): boolean {
    if (isValueChecker(featureDefinition.rule)) {
        return featureDefinition.rule.value === value;
    } 
    if (isListChecker(featureDefinition.rule)) {
        return featureDefinition.rule.value.includes(value);
    }
    if (isRangeChecker(featureDefinition.rule)) {
        return featureDefinition.rule.value.every(({min, max}) => 
            value >= min && value <= max
        )
    }
    if (isRegexMatcher(featureDefinition.rule)) {
        return new RegExp(featureDefinition.rule.value).test(value.toString())
    }

    throw new Error('Could not handle the rule type');
}

export const computeRulesState = (ruleDefinition: FeatureDefinition): FeatureDefinition['state'] => {
    const is_expired = (ruleDefinition.state.expires_at) ? ruleDefinition.state.expires_at < new Date().valueOf() : ruleDefinition.state.is_expired;
    return {
            is_enabled: ruleDefinition.state.is_enabled,
            is_expired: is_expired,
            created_at: ruleDefinition.state.created_at,
            expires_at: ruleDefinition.state.expires_at,
        }
}

export const checker = (ruleDefinition: FeatureDefinition, value: boolean | string | number ): RuleCheck => {
    const state = computeRulesState(ruleDefinition);
    const checkedValue = (!state.is_enabled || state.is_expired ) ? false : getCheckedValue(ruleDefinition, value);

    return {
        checks: {
            value: checkedValue
        },
        state
    }
}
