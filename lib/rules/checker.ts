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
    };
}

export type RuleCheck = {
    checks: {
        value: boolean,
    },
    state: {
        is_enabled: boolean,
        is_expired?: boolean,
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

export const checker = (featureName: string, value: boolean | string | number ): RuleCheck => {
    // TODO: use the feature which is the name in namespace:category:id format
    const ruleDefinition: FeatureDefinition = {
        id: "vpn_ip_range",
        description: "Defines the scoring range to consider when using AI to determine a score play.",
        rule: {
          type: 'regex_matcher',
          value: "^100\\.22\\.33\\.([1-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|250)$"
        },
        state: {
          is_enabled: true
        }
      };

    const checkedValue = getCheckedValue(ruleDefinition, value);
    const is_expired = ruleDefinition.state.is_expired;

    return {
        checks: {
            value: checkedValue
        },
        state: {
            is_enabled: ruleDefinition.state.is_enabled,
            is_expired, 
        }
    }
}
