
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  publicTitle: 'publicTitle',
  publicSubtitle: 'publicSubtitle',
  shortDescription: 'shortDescription',
  fullDescription: 'fullDescription',
  hostName: 'hostName',
  propertyType: 'propertyType',
  category: 'category',
  accommodationType: 'accommodationType',
  maxGuests: 'maxGuests',
  bedrooms: 'bedrooms',
  beds: 'beds',
  bathrooms: 'bathrooms',
  allowsPets: 'allowsPets',
  maxPets: 'maxPets',
  buildingFloors: 'buildingFloors',
  floorNumber: 'floorNumber',
  constructionYear: 'constructionYear',
  propertySize: 'propertySize',
  propertySizeUnit: 'propertySizeUnit',
  street: 'street',
  streetNumber: 'streetNumber',
  neighborhood: 'neighborhood',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  locationText: 'locationText',
  latitude: 'latitude',
  longitude: 'longitude',
  publicLatitude: 'publicLatitude',
  publicLongitude: 'publicLongitude',
  isActive: 'isActive',
  basePrice: 'basePrice',
  cleaningFee: 'cleaningFee',
  minimumNights: 'minimumNights',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  channexId: 'channexId'
};

exports.Prisma.GuestScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  status: 'status',
  isVip: 'isVip',
  isFiveStar: 'isFiveStar',
  notes: 'notes',
  sourceChannel: 'sourceChannel',
  totalBookings: 'totalBookings',
  completedStays: 'completedStays',
  totalRevenueGenerated: 'totalRevenueGenerated',
  lastReservationAt: 'lastReservationAt',
  lastStayAt: 'lastStayAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  role: 'role'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  guestId: 'guestId',
  checkIn: 'checkIn',
  checkOut: 'checkOut',
  status: 'status',
  totalAmount: 'totalAmount',
  nightlyRate: 'nightlyRate',
  cleaningFee: 'cleaningFee',
  totalNights: 'totalNights',
  holdExpiresAt: 'holdExpiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  numGuests: 'numGuests'
};

exports.Prisma.ReservationOccupantScalarFieldEnum = {
  id: 'id',
  reservationId: 'reservationId',
  name: 'name',
  document: 'document',
  isChild: 'isChild'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  reservationId: 'reservationId',
  gatewayTransactionId: 'gatewayTransactionId',
  provider: 'provider',
  method: 'method',
  status: 'status',
  amount: 'amount',
  externalId: 'externalId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlockedDateScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  date: 'date',
  source: 'source',
  reservationId: 'reservationId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.AvailabilityWindowScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  startDate: 'startDate',
  endDate: 'endDate',
  mode: 'mode',
  rollingDays: 'rollingDays',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NightlyOverrideScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  date: 'date',
  price: 'price',
  minimumNights: 'minimumNights',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PricingRuleScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  type: 'type',
  value: 'value',
  description: 'description',
  minDays: 'minDays',
  startDate: 'startDate',
  endDate: 'endDate',
  color: 'color',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  platform: 'platform',
  icalUrl: 'icalUrl',
  lastSyncAt: 'lastSyncAt',
  createdAt: 'createdAt'
};

exports.Prisma.SyncLogScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  platform: 'platform',
  status: 'status',
  eventsAdded: 'eventsAdded',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt'
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  mercadoPagoPublicKey: 'mercadoPagoPublicKey',
  mercadoPagoAccessToken: 'mercadoPagoAccessToken',
  whatsappNumber: 'whatsappNumber',
  contactEmail: 'contactEmail',
  minNightsDefault: 'minNightsDefault',
  maxGuestsDefault: 'maxGuestsDefault',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReservationLinkScalarFieldEnum = {
  id: 'id',
  token: 'token',
  propertyId: 'propertyId',
  discount: 'discount',
  expiresAt: 'expiresAt',
  preFilledDates: 'preFilledDates',
  createdAt: 'createdAt'
};

exports.Prisma.PropertyPhotoScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  imageUrl: 'imageUrl',
  sortOrder: 'sortOrder',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt'
};

exports.Prisma.PropertyAmenityScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  amenityKey: 'amenityKey',
  amenityName: 'amenityName',
  iconName: 'iconName',
  sortOrder: 'sortOrder',
  isActive: 'isActive'
};

exports.Prisma.PropertyRuleScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  ruleText: 'ruleText',
  iconName: 'iconName',
  sortOrder: 'sortOrder',
  isActive: 'isActive'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

exports.ReservationStatus = exports.$Enums.ReservationStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  PIX: 'PIX',
  CREDIT_CARD: 'CREDIT_CARD'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED'
};

exports.BlockedSource = exports.$Enums.BlockedSource = {
  AIRBNB: 'AIRBNB',
  BOOKING: 'BOOKING',
  CHANNEX: 'CHANNEX',
  ADMIN: 'ADMIN',
  DIRECT_RESERVATION: 'DIRECT_RESERVATION',
  MANUAL: 'MANUAL'
};

exports.WindowMode = exports.$Enums.WindowMode = {
  MANUAL_RANGE: 'MANUAL_RANGE',
  ROLLING_FROM_TODAY: 'ROLLING_FROM_TODAY'
};

exports.RuleType = exports.$Enums.RuleType = {
  WEEKEND_SURGE: 'WEEKEND_SURGE',
  LAST_MINUTE: 'LAST_MINUTE',
  EARLY_BIRD: 'EARLY_BIRD',
  SEASONAL: 'SEASONAL'
};

exports.Platform = exports.$Enums.Platform = {
  AIRBNB: 'AIRBNB',
  BOOKING: 'BOOKING',
  CHANNEX: 'CHANNEX'
};

exports.SyncStatus = exports.$Enums.SyncStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  Property: 'Property',
  Guest: 'Guest',
  Account: 'Account',
  Session: 'Session',
  User: 'User',
  VerificationToken: 'VerificationToken',
  Reservation: 'Reservation',
  ReservationOccupant: 'ReservationOccupant',
  Payment: 'Payment',
  BlockedDate: 'BlockedDate',
  AvailabilityWindow: 'AvailabilityWindow',
  NightlyOverride: 'NightlyOverride',
  PricingRule: 'PricingRule',
  Integration: 'Integration',
  SyncLog: 'SyncLog',
  SystemSettings: 'SystemSettings',
  ReservationLink: 'ReservationLink',
  PropertyPhoto: 'PropertyPhoto',
  PropertyAmenity: 'PropertyAmenity',
  PropertyRule: 'PropertyRule'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
