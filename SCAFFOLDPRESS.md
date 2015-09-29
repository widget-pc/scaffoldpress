===================================
> STEPS
===================================
1. Download one clen vertion of http://wppb.me/ with the correct plugin name
2. Rename this folder "scaffoldpress-for-plugin" for your plugin name
3. Copy al content of wppb.me here
	-------------
	Structure
	-------------
	> admin
	> includes
	> languages
	> public
	- plugin-name.php
	- index.php
	- uninstall.php	
	- LICENSE.txt
	- README.txt
	
	- bower.json
	- gulpfile.js
	- package.json

4. Update the wp_enqueue in files public/plugin-name.php and admin/plugin-name.php
	CSS
	wp_enqueue_style( $this->plugin_name . "-theme" , plugin_dir_url( __FILE__ ) . 'css/theme.min.css',   array(), $this->version, 'all' );
	wp_enqueue_style( $this->plugin_name . "-vendor", plugin_dir_url( __FILE__ ) . 'css/vendors.min.css', array(), $this->version, 'all' );

	JS
	wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/celebrity-ranking-public.js', array( 'jquery' ), $this->version, false );

5. Open GulpFile and set the correct plugin-name (Line 6)
6. Run gulp and CSS and JS will be optimize
7. All structure for plugin
8. If you wany include WPC core in the plugn structure