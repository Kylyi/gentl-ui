import { LOCALE_DEFAULT, messages } from '~/utils/i18n'

// Types
import { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

const locale = LOCALE_DEFAULT

function t(key: string, count?: number) {
  const value = get(messages, `${locale}.${key}`) as string | undefined

  if (!value) {
    return ''
  }

  if (count) {
    const split = value.split('|')

    if (split.length > 1) {
      return split[1]
    } else {
      return split[0]
    }
  }

  return value
}

export const grantMentionItems: IWysiwygMentionItem[] = [
  // Program code
  {
    id: 'grant.programCode',
    label: t('grant.programCode'),
    group: t('grant.self', 1),
  },

  // Program name
  {
    id: 'grant.programName',
    label: t('grant.programName'),
    group: t('grant.self', 1),
  },

  // Department
  {
    id: 'grant.department.value',
    label: t('grant.department'),
    group: t('grant.self', 1),
  },

  // Grant type
  {
    id: 'grant.grantType.value',
    label: t('grant.grantType'),
    group: t('grant.self', 1),
  },

  // Grant allocation
  {
    id: 'grant.grantAllocation',
    label: t('grant.grantAllocation'),
    group: t('grant.self', 1),
    format: (row: any) => t(`grant.allocation.${row.grant.grantAllocation}`),
  },

  // Subprogram name
  {
    id: 'grant.subprogramName',
    label: t('grant.subprogramName'),
    group: t('grant.self', 1),
  },

  // Program announcment year
  {
    id: 'grant.programAnnouncementYear',
    label: t('grant.programAnnouncementYear'),
    group: t('grant.self', 1),
  },

  // Grant providing years
  {
    id: 'grant.grantProvidingYears',
    label: t('grant.grantProvidingYears'),
    group: t('grant.self', 1),
  },

  // Allocated amount
  {
    id: 'grant.allocatedAmount',
    label: t('grant.allocatedAmount'),
    group: t('grant.self', 1),
    dataType: 'number',
  },

  // Minimum grant amount
  {
    id: 'grant.minimumGrantAmount',
    label: t('grant.minimumGrantAmount'),
    group: t('grant.self', 1),
    dataType: 'number',
  },

  // Maximum grant amount
  {
    id: 'grant.maximumGrantAmount',
    label: t('grant.maximumGrantAmount'),
    group: t('grant.self', 1),
    dataType: 'number',
  },

  // Application deadline
  {
    id: 'grant.applicationDeadline',
    label: t('grant.applicationDeadline'),
    group: t('grant.self', 1),
    dataType: 'date',
  },

  // Fund usage deadline
  {
    id: 'grant.fundUsageDeadline',
    label: t('grant.fundUsageDeadline'),
    group: t('grant.self', 1),
    dataType: 'date',
  },

  // Territory dimensions
  {
    id: 'grant.territoryDimensions',
    label: t('grant.territoryDimensions'),
    group: t('grant.self', 1),
    format: (row: any) =>
      row.grant.territoryDimensions?.map((item: any) => item.value).join(', '),
  },

  // Entity types
  {
    id: 'grant.entityTypes',
    label: t('grant.entityTypes'),
    group: t('grant.self', 1),
    format: (row: any) => {
      return row.grant.entityTypes?.map((item: any) => item.value).join(', ')
    },
  },

  // Workgroup
  {
    id: 'grant.workGroup.value',
    label: t('grant.workgroup'),
    group: t('grant.self', 1),
  },

  // Default assignee
  {
    id: 'grant.defaultAssignee',
    label: t('grant.defaultAssignee'),
    group: t('grant.self', 1),
    format: (row: any) => `${row.grant.firstName} ${row.grant.lastName}`,
  },

  // Evidence number
  {
    id: 'grant.evidenceNumber',
    label: t('grant.evidenceNumber'),
    group: t('grant.self', 1),
  },
]

export const grantRequestMentionItems: IWysiwygMentionItem[] = [
  // ID
  {
    id: 'grantRequest.id',
    label: t('grantRequest.id'),
    group: t('grantRequest.self', 1),
  },

  // Amount requested
  {
    id: 'grantRequest.amountRequested',
    label: t('grantRequest.amountRequested'),
    group: t('grantRequest.self', 1),
  },

  // Total amount
  {
    id: 'grantRequest.totalAmount',
    label: t('grantRequest.totalAmount'),
    group: t('grantRequest.self', 1),
  },

  // Evidence number
  {
    id: 'grantRequest.evidenceNumber',
    label: t('grantRequest.evidenceNumber'),
    group: t('grantRequest.self', 1),
  },
]

export const grantRequesterMentionItems: IWysiwygMentionItem[] = [
  // Name
  {
    id: 'grantRequestRequester._name',
    label: t('grantRequest.requester.self', 1),
    group: t('grantRequest.requester.self', 1),
    format: row => {
      if (!row.grantRequestRequester) {
        return undefined
      }

      return (
        row.grantRequestRequester?.name ||
        `${row.grantRequestRequester?.firstName} ${row.grantRequestRequester?.lastName}`
      )
    },
  },

  // CIN
  {
    id: 'grantRequestRequester.cin',
    label: t('grantRequest.requester.cin'),
    group: t('grantRequest.requester.self', 1),
  },

  // TIN
  {
    id: 'grantRequestRequester.tin',
    label: t('grantRequest.requester.tin'),
    group: t('grantRequest.requester.self', 1),
  },

  // Permanent address
  {
    id: 'grantRequestRequester.permanentAddress',
    label: t('grantRequest.requester.permanentAddress'),
    group: t('grantRequest.requester.self', 1),
    format: row => {
      if (!row.grantRequestRequester?.permanentAddress) {
        return ''
      }

      return `${row.grantRequestRequester.permanentAddress.street}, ${row.grantRequestRequester.permanentAddress.city} ${row.grantRequestRequester.permanentAddress.zip}`
    },
  },

  // Correspondence address
  {
    id: 'grantRequestRequester.correspondenceAddress',
    label: t('grantRequest.requester.correspondenceAddress'),
    group: t('grantRequest.requester.self', 1),
    format: row => {
      if (!row.grantRequestRequester?.correspondenceAddress) {
        return ''
      }

      return `${row.grantRequestRequester.correspondenceAddress.street}, ${row.grantRequestRequester.correspondenceAddress.city} ${row.grantRequestRequester.correspondenceAddress.zip}`
    },
  },

  // Databox
  {
    id: 'grantRequestRequester.databox.contact',
    label: t('grantRequest.requester.databox'),
    group: t('grantRequest.requester.self', 1),
  },

  // Bank name
  {
    id: 'grantRequestRequester.bankConnection.bankName',
    label: t('grantRequest.requester.bankName'),
    group: t('grantRequest.requester.self', 1),
  },

  // Bank account number
  {
    id: 'grantRequestRequester.bankConnection.accountNumber',
    label: t('grantRequest.requester.bankAccountNumber'),
    group: t('grantRequest.requester.self', 1),
  },
]

export const mentionItemsMap = new Map(
  [
    ...grantMentionItems,
    ...grantRequestMentionItems,
    ...grantRequesterMentionItems,
  ].map(item => [item.id, item] as [string, IWysiwygMentionItem])
)
