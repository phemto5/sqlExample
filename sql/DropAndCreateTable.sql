USE [WagEngineering]
GO

/****** Object:  Table [dbo].[SolidworksLicUse]    Script Date: 11/18/2016 11:17:53 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolidworksLicUse]') AND type in (N'U'))
DROP TABLE [dbo].[SolidworksLicUse]
GO

USE [WagEngineering]
GO

/****** Object:  Table [dbo].[SolidworksLicUse]    Script Date: 11/18/2016 11:17:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SolidworksLicUse](
	[DateTime] [datetime] NOT NULL,
	[Product] [nvarchar](250) NOT NULL,
	[Action] [nvarchar](250) NOT NULL,
	[Entrypoint] [nvarchar](250) NOT NULL,
	[UserEmail] [nvarchar](250) NOT NULL,
	[FullString] [nvarchar](max) NOT NULL,
	[DailyMax] [int] NOT NULL,
	[LineNumber] [int] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO


