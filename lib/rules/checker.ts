
export enum RuleTypeEnum {
    LIST_CHECKER = 'list_checker',
    RANGE_CHECKER = 'range_checker',
    REGEX_MATCHER = 'regex_matcher',
    STATE_CHECKER = 'state_checker',
    VALUE_CHECKER = 'value_checker',
}

type RuleTypeForValueChecker = {
    type: RuleTypeEnum.VALUE_CHECKER;
    value: string | boolean | number;
}

type RuleTypeForListChecker = {
    type: RuleTypeEnum.LIST_CHECKER;
    value: (string | boolean | number)[];
}

type RuleTypeForStateChecker= {
    type: RuleTypeEnum.STATE_CHECKER;
    value: boolean;
}

type RuleTypeForRangeChecker = {
    type: RuleTypeEnum.RANGE_CHECKER;
    value: { min: number; max: number }[];
}

type RuleTypeForRegexMatcher = {
    type: RuleTypeEnum.REGEX_MATCHER;
    value: string;
}

export type RuleDefinition = {
    id: string;
    description: string;
    rule: RuleTypeForListChecker | RuleTypeForValueChecker | RuleTypeForRangeChecker | RuleTypeForRegexMatcher | RuleTypeForStateChecker;
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
        is_expired: boolean,
    }
}

function isValueChecker(rule: RuleDefinition['rule']): rule is RuleTypeForValueChecker {
    return rule.type === RuleTypeEnum.VALUE_CHECKER;
}

function isStateChecker(rule: RuleDefinition['rule']): rule is RuleTypeForStateChecker {
    return rule.type === RuleTypeEnum.STATE_CHECKER;
}

function isListChecker(rule: RuleDefinition['rule']): rule is RuleTypeForListChecker {
    return rule.type === RuleTypeEnum.LIST_CHECKER;
}

function isRangeChecker(rule: RuleDefinition['rule']): rule is RuleTypeForRangeChecker {
    return rule.type === RuleTypeEnum.RANGE_CHECKER;
}

function isRegexMatcher(rule: RuleDefinition['rule']): rule is RuleTypeForRegexMatcher {
    return rule.type === RuleTypeEnum.REGEX_MATCHER;
}

function getCheckedValue(ruleDefinition: RuleDefinition, value: boolean | string | number): boolean {
    if (isValueChecker(ruleDefinition.rule)) {
        return ruleDefinition.rule.value === value;
    } 
    if (isStateChecker(ruleDefinition.rule)) {
        return ruleDefinition.state.is_enabled === value;
    }
    if (isListChecker(ruleDefinition.rule)) {
        return ruleDefinition.rule.value.includes(value);
    }
    if (isRangeChecker(ruleDefinition.rule)) {
        return ruleDefinition.rule.value.every(({min, max}) => 
            value >= min && value <= max
        )
    }
    if (isRegexMatcher(ruleDefinition.rule)) {
        return new RegExp(ruleDefinition.rule.value).test(value.toString())
    }

    throw new Error('Could not handle the rule type');
}

export const checker = (feature: string, value: boolean | string | number ): RuleCheck => {
    // TODO: use the feature which is the name in namespace:category:id format
    const ruleDefinition: RuleDefinition = {
        id: "vpn_ip_range",
        description: "Defines the scoring range to consider when using AI to determine a score play.",
        rule: {
          type: RuleTypeEnum.REGEX_MATCHER,
          value: "^100\\.22\\.33\\.([1-9]|[1-9]\\d|1\\d\\d|2[0-4]\\d|250)$"
        },
        state: {
          is_enabled: true
        }
      };

    const checkedValue = getCheckedValue(ruleDefinition, value);

    return {
        checks: {
            value: checkedValue
        },
        state: {
            is_enabled: ruleDefinition.state.is_enabled,
            is_expired: Boolean(ruleDefinition.state.is_expired)
        }
    }
}
