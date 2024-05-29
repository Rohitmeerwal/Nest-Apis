import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './auth.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from 'src/token/token.service';
import { JwtAuthGuard } from 'src/token/auth-token.gaurd';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApifeaturesService } from 'src/apifeatures/apifeatures.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    PassportModule,
    JwtModule.register({
      secret: 'fgvbkjgnvnjnvbrhf',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    CloudinaryService,
    ApifeaturesService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
