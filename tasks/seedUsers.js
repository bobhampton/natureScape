//import usersData from '../data/users.js'
import bcrypt from 'bcryptjs'
import usersData from '../data/users.js'

// Function to seed users
export const seedUsers = async () => {
  console.log('Seeding users. This takes a while due to password hashing...')

  //let saltRounds = 16
  let saltRounds = 4

  const users = [
    {
      firstName: 'adminFirst',
      lastName: 'adminLast',
      email: 'admin@gmail.com',
      username: 'admin',
      password: 'admin',
      agreement: true,
      bio: 'admin Enter bio here',
      role: 'admin'
    },
    {
      firstName: 'userFirst',
      lastName: 'userLast',
      email: 'user@gmail.com',
      username: 'user',
      password: 'user',
      agreement: true,
      bio: 'user Enter bio here',
      role: 'user'
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@gmail.com',
      username: 'johndoe',
      password: 'hashed_password_123',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'janesmith@hotmail.com',
      username: 'janesmith',
      password: 'hashed_password_456',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alicejohnson@gmail.com',
      username: 'alicejohnson',
      password: 'password1',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bobbrown@gmail.com',
      username: 'bobbrown',
      password: 'password2',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Charlie',
      lastName: 'Davis',
      email: 'charliedavis@gmail.com',
      username: 'charliedavis',
      password: 'password3',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'David',
      lastName: 'Evans',
      email: 'davidevans@gmail.com',
      username: 'davidevans',
      password: 'password4',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Eve',
      lastName: 'Foster',
      email: 'evefoster@gmail.com',
      username: 'evefoster',
      password: 'password5',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Frank',
      lastName: 'Green',
      email: 'frankgreen@gmail.com',
      username: 'frankgreen',
      password: 'password6',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Grace',
      lastName: 'Harris',
      email: 'graceharris@gmail.com',
      username: 'graceharris',
      password: 'password7',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Hank',
      lastName: 'Ivy',
      email: 'hankivy@gmail.com',
      username: 'hankivy',
      password: 'password8',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Ivy',
      lastName: 'Jones',
      email: 'ivyjones@gmail.com',
      username: 'ivyjones',
      password: 'password9',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Jack',
      lastName: 'King',
      email: 'jackking@gmail.com',
      username: 'jackking',
      password: 'password10',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Karen',
      lastName: 'Lewis',
      email: 'karenlewis@gmail.com',
      username: 'karenlewis',
      password: 'password11',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Leo',
      lastName: 'Miller',
      email: 'leomiller@gmail.com',
      username: 'leomiller',
      password: 'password12',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Mia',
      lastName: 'Nelson',
      email: 'mianelson@gmail.com',
      username: 'mianelson',
      password: 'password13',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Nina',
      lastName: 'Owens',
      email: 'ninaowens@gmail.com',
      username: 'ninaowens',
      password: 'password14',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Oscar',
      lastName: 'Parker',
      email: 'oscarparker@gmail.com',
      username: 'oscarparker',
      password: 'password15',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Paul',
      lastName: 'Quinn',
      email: 'paulquinn@gmail.com',
      username: 'paulquinn',
      password: 'password16',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Quincy',
      lastName: 'Reed',
      email: 'quincyreed@gmail.com',
      username: 'quincyreed',
      password: 'password17',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Rachel',
      lastName: 'Scott',
      email: 'rachelscott@gmail.com',
      username: 'rachelscott',
      password: 'password18',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Sam',
      lastName: 'Taylor',
      email: 'samtaylor@gmail.com',
      username: 'samtaylor',
      password: 'password19',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Tina',
      lastName: 'Upton',
      email: 'tinaupton@gmail.com',
      username: 'tinaupton',
      password: 'password20',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Uma',
      lastName: 'Vance',
      email: 'umavance@gmail.com',
      username: 'umavance',
      password: 'password21',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Victor',
      lastName: 'White',
      email: 'victorwhite@gmail.com',
      username: 'victorwhite',
      password: 'password22',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Wendy',
      lastName: 'Xavier',
      email: 'wendyxavier@gmail.com',
      username: 'wendyxavier',
      password: 'password23',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Xander',
      lastName: 'Young',
      email: 'xanderyoung@gmail.com',
      username: 'xanderyoung',
      password: 'password24',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Yara',
      lastName: 'Zimmerman',
      email: 'yarazimmerman@gmail.com',
      username: 'yarazimmerman',
      password: 'password25',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    },
    {
      firstName: 'Zane',
      lastName: 'Adams',
      email: 'zaneadams@gmail.com',
      username: 'zaneadams',
      password: 'password26',
      agreement: true,
      bio: 'Enter bio here',
      role: 'user'
    }
  ]

  try {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds)
      await usersData.createUser(
        user.firstName,
        user.lastName,
        user.email,
        user.username,
        hashedPassword,
        user.agreement,
        user.bio,
        user.role
      )
    }
    console.log('Users created successfully!')
  } catch (error) {
    console.error('Error while creating users:', error)
  }
}
