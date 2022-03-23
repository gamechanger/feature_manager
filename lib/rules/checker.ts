
export enum RuleTypeEnum {
    STATE_CHECKER = 'state_checker',
    RANGE_CHECKER = 'range_checker',
    LIST_CHECKER = 'list_checker',
}

type RuleTypeForState = {
    type: RuleTypeEnum.STATE_CHECKER;
    value: string | boolean | number;
}

type RuleTypeForList = {
    type: RuleTypeEnum.LIST_CHECKER;
    value: (string | boolean | number)[];
}

type RuleTypeForRange = {
    type: RuleTypeEnum.RANGE_CHECKER;
    value: { min: number; max: number }[];
}

export type RuleDefinition = {
    id: string;
    description: string;
    rule: RuleTypeForList | RuleTypeForState | RuleTypeForRange;
    state: {
        is_enabled: boolean;
        is_expired: null | boolean;
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

function isStateChecker(rule: RuleDefinition['rule']): rule is RuleTypeForState {
    return rule.type === RuleTypeEnum.STATE_CHECKER;
}

function isListChecker(rule: RuleDefinition['rule']): rule is RuleTypeForList {
    return rule.type === RuleTypeEnum.LIST_CHECKER;
}

function isRangeChecker(rule: RuleDefinition['rule']): rule is RuleTypeForRange {
    return rule.type === RuleTypeEnum.RANGE_CHECKER;
}

function getCheckedValue(ruleDefinition: RuleDefinition, value: boolean | string | number): boolean {
    if (isStateChecker(ruleDefinition.rule)) {
        return ruleDefinition.rule.value === value;
    }  
    if (isListChecker(ruleDefinition.rule)) {
        return ruleDefinition.rule.value.includes(value);
    }
    if (isRangeChecker(ruleDefinition.rule)) {
        console.log('Yes this is a state checker', ruleDefinition.rule.value, value)
        return ruleDefinition.rule.value.every(({min, max}) => 
            value >= min && value <= max
        )
    }

    throw new Error('Could not handle the rule type');
}

export const checker = (feature: string, value: boolean | string | number ): RuleCheck => {
    // TODO: use the feature which is the name in namespace:category:id format
    // const ruleDefinition: RuleDefinition = {
    //     id: "send_advertising_email",
    //     description: "Checks whether we should send the advertising email or not",	  
    //     rule: {
    //         type: RuleTypeEnum.STATE_CHECKER,
    //         value: false
    //     },
    //     state: {
    //         is_enabled: true,
    //         is_expired: null
    //     }
    // };
    const ruleDefinition: RuleDefinition = {
        "id": "score_on_range",
        "description": "Defines the scoring range to consider when using AI to determine a score play.",
      
        "rule": {
          "type": RuleTypeEnum.RANGE_CHECKER,
          "value": [
            {
              "min": 0.2,
              "max": 1
            }]
        },
      
        "state": {
          "is_enabled": true,
          "is_expired": null
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
