   { pkgs ? import <nixpkgs> {} }:

   pkgs.mkShell {
     buildInputs = [
       pkgs.nodejs-18_x        # Use Node.js version 18.x
       pkgs.docker              # Use the latest version of Docker
       pkgs.docker-compose      # Add Docker Compose
       pkgs.go_1_22             # Update to Go version 1.22
       pkgs.prisma              # Use the latest version of Prisma ORM
       pkgs.git                 # Add Git
       pkgs.curl                # Add Curl
       pkgs.go-tools            # Optional: Go tools
     ];
   }